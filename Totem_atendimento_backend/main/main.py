from flask import request, Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text  
from dotenv import load_dotenv
from threading import Lock
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.units import mm
from collections import defaultdict
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import win32print
import win32api
import os
import tempfile
import threading
import time
import hashlib
import json

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configura a impressora
lista_impressora = win32print.EnumPrinters(2)
impressora = lista_impressora[2]
print(impressora)
win32print.SetDefaultPrinter(impressora[2])

# Variável global para o controle do número de atendimento e ticket atual
ticket_number = 0
ticket_atual = 0
latest_pedidos = []
tickets_por_atendente = defaultdict(int)
lock = Lock()

# Configuração da URL do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Opcional, desativa o rastreamento de modificações
db = SQLAlchemy(app)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

@app.route('/postgressql/login', methods=['POST'])
def login():
   data = request.json
   username = data.get('username')
   password = data.get('password')

   # Consulta o usuário pelo nome de usuário
   sql = text("SELECT DISTINCT u.cd_usuario, u.login, u.senha, f.nm_funcionario FROM public.usuario u INNER JOIN public.funcionario f ON u.cd_funcionario = f.cd_funcionario WHERE u.login = :username;")
   result = db.session.execute(sql, {'username': username})
   usuario = result.fetchone()  # Obtém um único resultado


   if usuario is None:
         return jsonify({'error': 'Usuário não encontrado'}), 404

   stored_password_hash = usuario.senha

   # Codifica a senha fornecida pelo usuário em bytes e calcula o hash MD5
   md5_password = hashlib.md5(password.encode()).hexdigest().upper()

   if md5_password == stored_password_hash:
      user_data = {
         'cd_usuario': usuario.cd_usuario,
         'login': usuario.login,
         'nome_funcionario': usuario.nm_funcionario
        }
      return jsonify({'success': user_data}), 200
   else:
        return jsonify({'error': 'Senha incorreta'}), 401

@app.route('/salvar_ticket', methods=['POST'])
def salvar_ticket():
   global ticket_number  # Usa a variável global para acessar o número de tickets

   try:
      # Obter o timestamp atual
      timestamp = datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')

      # Evita salvar caso o número de tickets seja 1 (indica que não há tickets emitidos)
      if ticket_number == 1:
         return jsonify({'message': 'Nenhum ticket emitido para salvar'}), 200

      # Salvar a quantidade de tickets e o timestamp no arquivo
      with open('tickets_log.txt', 'a') as file:
         file.write(f'{timestamp} - Quantidade de tickets: {ticket_number - 1}\n')

      # Reinicia o contador de tickets no backend
      ticket_number = 1

      return jsonify({'message': 'Quantidade de tickets salva com sucesso'}), 200

   except Exception as e:
      return jsonify({'error': str(e)}), 500

@app.route('/imprimir_atendimento', methods=['POST'])
def imprimir_atendimento():
   global ticket_number  # Usa uma variável global para incrementar o número

   try:
      # Gera o número do atendimento automaticamente
      numero_atendimento = ticket_number
      ticket_number += 1

      # Configura o caminho do arquivo temporário para o PDF
      caminho_temp = os.path.join(tempfile.gettempdir(), f"atendimento_{numero_atendimento + 1}.pdf")

      # Defina o tamanho personalizado em milímetros
      largura_mm = 110  # 75 mm de largura
      comprimento_mm = 400  # 240 mm de comprimento

      # Converta para pontos
      largura_pontos = largura_mm * mm
      comprimento_pontos = comprimento_mm * mm

      # Crie o tamanho personalizado
      tamanho_customizado = (largura_pontos, comprimento_pontos)

      # Cria o documento PDF
      doc = SimpleDocTemplate(caminho_temp, pagesize=tamanho_customizado)
      elements = []

      # Estilo básico para o texto
      styles = getSampleStyleSheet()

      estilo_titulo = styles['Title']
      estilo_titulo.fontSize = 80
      estilo_titulo.spaceAfter = 50
      estilo_titulo.spaceBefore = 0

      sub_titulo = estilo_titulo.clone('SubTitulo')
      sub_titulo.fontSize = 10
      sub_titulo.spaceAfter = 0
      sub_titulo.spaceBefore = 0

      texto = estilo_titulo.clone('Texto')
      texto.fontSize = 8
      texto.spaceAfter = 0
      texto.spaceBefore = 0

      titulo_colado = estilo_titulo.clone('MenosEspaco')
      titulo_colado.spaceAfter = 0
      titulo_colado.spaceBefore = 0

      caminho_imagem = "./SOCCOL.png"
      imagem = Image(caminho_imagem)
      imagem.drawHeight = 0.40 * imagem.imageHeight
      imagem.drawWidth = 0.40 * imagem.imageWidth

      # Adiciona os elementos ao PDF
      elements.append(imagem)
      elements.append(Paragraph(f"{numero_atendimento + 1}", estilo_titulo))
      elements.append(Spacer(10, 50))
      elements.append(Paragraph("Conheça nossa plataforma digital:", texto))
      elements.append(Paragraph("b2b.soccolbarbieri.com.br", texto))

      # Gera o PDF
      doc.build(elements)

      # Imprime o PDF
      win32api.ShellExecute(0, "print", caminho_temp, None, ".", 0)

      # Aguarda um curto período de tempo para garantir que o aplicativo consiga acessar o arquivo
      time.sleep(5)

      # Exclui o arquivo temporário após a impressão
      os.remove(caminho_temp)

      # Envia uma atualização via WebSocket informando que um novo ticket foi impresso
      socketio.emit('ticket_impresso_atualizado', {'ticket_impresso': ticket_number})

      # Retorna o número do atendimento gerado ao front-end
      return jsonify({'message': 'PDF gerado e impresso com sucesso!', 'numero': numero_atendimento}), 200

   except Exception as e:
      return jsonify({'error': str(e)}), 500

@app.route('/ticket_impresso', methods=['GET'])
def obter_ticket_impresso():
    global ticket_number
    try:
        return jsonify({'ticket_atual': ticket_number}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ticket_atual', methods=['GET'])
def obter_ticket_atual():
    global ticket_atual
    try:
        return jsonify({"ticket_atual": ticket_atual}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chamar_ticket', methods=['POST'])
def chamar_ticket():
    global ticket_atual

    with lock:
        ticket_atual += 1
        socketio.emit('ticket_atualizado', {"ticket_atual": ticket_atual})  # Envia atualização via WebSocket
        return jsonify({"ticket_atual": ticket_atual, "message": f"Ticket {ticket_atual} chamado com sucesso!"}), 200

@socketio.on('connect')
def handle_connect():
    print('Cliente conectado')

    # Enviar os valores atuais para o cliente
    socketio.emit('ticket_atualizado', {'ticket_atual': ticket_atual})
    socketio.emit('ticket_impresso_atualizado', {'ticket_impresso': ticket_number})

@socketio.on('novo_ticket_chamado')
def handle_novo_ticket_chamado(data):
    #{'ticketNumber': 1, 'attendantName': 'KLEIDSON'}
    attendant_name = data['attendantName']
    
    # Incrementa o contador para o atendente específico
    tickets_por_atendente[attendant_name] += 1

    print(f'{attendant_name} chamou mais um ticket. Total atual: {tickets_por_atendente[attendant_name]}')
    print(f'Novo ticket chamado: {data}')
    # Emite o evento para todos os clientes conectados
    socketio.emit('novo_ticket_chamado', data)

@socketio.on('/postgressql/pedidos')
def pedidos():
    # Quando o cliente se conectar, ele receberá os pedidos atuais
    socketio.emit('atualizacao_pedidos', latest_pedidos)

def iniciar_background_task():
    thread = threading.Thread(target=consultar_pedidos_periodicamente)
    thread.daemon = True
    thread.start()

def salvar_dados():
    now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    if not tickets_por_atendente:
        print('sem ticket')
        return

    # Diretório para salvar os arquivos
    directory = 'Tickets'
    
    # Cria o diretório, se ele não existir
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # Caminho completo do arquivo
    file_path = os.path.join(directory, f'tickets_{now}.json')
    
    # Verifica o conteúdo antes de salvar
    print("Conteúdo de tickets_por_atendente antes de salvar:", tickets_por_atendente)
    
    
    # Salva os dados em um arquivo JSON
    with open(file_path, 'w') as file:
        json.dump(tickets_por_atendente, file, indent=4)
    
    print(f"Dados salvos no arquivo {file_path}")
    
    # Limpa os dados para a próxima contagem
    tickets_por_atendente.clear()

def consultar_pedidos_periodicamente():
    global latest_pedidos
    with app.app_context():  # Cria o contexto da aplicação Flask para essa thread
        while True:
            # Define a consulta SQL
            sql = text("""
                SELECT DISTINCT 
                    ltrim((SUBSTRING(public.pedido_venda_afv.nr_pedido_afv FROM 3 FOR 20)),'0') AS pedido,
                    public.situacao_pedido_venda.cd_situacao,
                    public.situacao_pedido_venda.nm_situacao,
                    public.tarefa_monitor.id_origem_tarefa,
                    public.tarefa_monitor.nm_tarefa_monitor,
                    public.pedido_venda.id_geral AS id_pedido_soccol,
                    public.pedido_venda.cd_filial,
                    public.pedido_venda.dt_atz 
                FROM
                    public.pedido_venda
                    LEFT JOIN public.situacao_pedido_venda 
                        ON public.pedido_venda.cd_situacao = public.situacao_pedido_venda.cd_situacao
                    LEFT JOIN public.pedido_venda_afv 
                        ON public.pedido_venda.id_geral = public.pedido_venda_afv.id_pedido_venda_gerado
                    LEFT JOIN public.tarefa_monitor 
                        ON public.pedido_venda.id_geral = public.tarefa_monitor.id_origem_tarefa
                WHERE
                    public.pedido_venda.cd_filial = 1
                    AND public.pedido_venda.dt_emissao >= current_timestamp - INTERVAL '1 day'
                    AND public.pedido_venda.cd_operacao IN ('501')
                    AND public.situacao_pedido_venda.cd_situacao IN ('40')
                    AND public.tarefa_monitor.cd_monitor = 111 
                ORDER BY
                    public.pedido_venda.dt_atz DESC
            """)

            # Executa a consulta no banco de dados
            result = db.session.execute(sql)

            # Converte os resultados em uma lista de dicionários
            pedidos_atual = []
            for row in result:
                pedidos_atual.append({
                    "pedido": row[0],
                    "cd_situacao": row[1],
                    "nm_situacao": row[2],
                    "id_origem_tarefa": row[3],
                    "nm_tarefa_monitor": row[4],
                    "id_pedido_soccol": row[5],
                    "cd_filial": row[6],
                    "dt_atz": row[7].isoformat() if row[7] else None
                })

            if pedidos_atual != latest_pedidos:
                latest_pedidos = pedidos_atual
                socketio.emit('atualizacao_pedidos', pedidos_atual)


            time.sleep(15)

scheduler = BackgroundScheduler()
scheduler.add_job(salvar_dados, 'cron', hour=12, minute=0)
scheduler.add_job(salvar_dados, 'cron', hour=18, minute=0)

if __name__ == '__main__':
   iniciar_background_task()
   scheduler.start()
   app.run(debug=True, host='0.0.0.0', port=9000)
