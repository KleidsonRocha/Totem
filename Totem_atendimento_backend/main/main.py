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
from sqlalchemy.exc import OperationalError

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configura a impressora
lista_impressora = win32print.EnumPrinters(2)
impressora = lista_impressora[2]
print(impressora[2])
win32print.SetDefaultPrinter(impressora[2])

# Variável global para o controle do número de atendimento e ticket atual
ticket_number = 0
ticket_atual = 0
latest_pedidos = []
tickets_por_atendente = defaultdict(int)
lock = Lock()

# Configuração da URL do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

class TotemAtendimento(db.Model):
    __tablename__ = 'toten_atendimentos'
    __table_args__ = {'schema': 'soccol'}  # Schema específico
    
    id = db.Column(db.Integer, primary_key=True)
    data_hora = db.Column(db.DateTime, nullable=False, default=datetime.now)
    atendente = db.Column(db.String(100), nullable=False)
    quantidade_tickets = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    
    def __repr__(self):
        return f'<TotemAtendimento {self.atendente}: {self.quantidade_tickets} tickets>'

@app.route('/postgressql/login', methods=['POST'])
def login():
   data = request.json
   username = data.get('username')
   password = data.get('password')

   # Consulta o usuário pelo nome de usuário
   sql = text("SELECT DISTINCT u.cd_usuario, u.login, u.senha, f.nm_funcionario FROM public.usuario u INNER JOIN public.funcionario f ON u.cd_funcionario = f.cd_funcionario WHERE u.login = :username;")
   result = db.session.execute(sql, {'username': username})
   usuario = result.fetchone()

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
   global ticket_number

   try:
      timestamp = datetime.now().strftime('%d-%m-%Y %H:%M:%S')

      if ticket_number == 1:
         return jsonify({'message': 'Nenhum ticket emitido para salvar'}), 200

      with open('tickets_log.txt', 'a') as file:
         file.write(f'{timestamp} - Quantidade de tickets: {ticket_number - 1}\n')

      ticket_number = 1

      return jsonify({'message': 'Quantidade de tickets salva com sucesso'}), 200

   except Exception as e:
      return jsonify({'error': str(e)}), 500

@app.route('/imprimir_atendimento', methods=['POST'])
def imprimir_atendimento():
   global ticket_number

   try:
      numero_atendimento = ticket_number
      ticket_number += 1

      caminho_temp = os.path.join(tempfile.gettempdir(), f"atendimento_{numero_atendimento + 1}.pdf")

      largura_mm = 110
      comprimento_mm = 400

      largura_pontos = largura_mm * mm
      comprimento_pontos = comprimento_mm * mm

      tamanho_customizado = (largura_pontos, comprimento_pontos)

      doc = SimpleDocTemplate(caminho_temp, pagesize=tamanho_customizado)
      elements = []

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

      elements.append(imagem)
      elements.append(Paragraph(f"{numero_atendimento + 1}", estilo_titulo))
      elements.append(Spacer(10, 50))
      elements.append(Paragraph("Conheça nossa plataforma digital:", texto))
      elements.append(Paragraph("b2b.soccolbarbieri.com.br", texto))

      doc.build(elements)

      win32api.ShellExecute(0, "print", caminho_temp, None, ".", 0)

      time.sleep(5)

      os.remove(caminho_temp)

      socketio.emit('ticket_impresso_atualizado', {'ticket_impresso': ticket_number})

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
        socketio.emit('ticket_atualizado', {"ticket_atual": ticket_atual})
        return jsonify({"ticket_atual": ticket_atual, "message": f"Ticket {ticket_atual} chamado com sucesso!"}), 200

@app.route('/consultar_atendimentos', methods=['GET'])
def consultar_atendimentos():
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        query = TotemAtendimento.query
        
        if data_inicio:
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(TotemAtendimento.data_hora >= data_inicio_obj)
            
        if data_fim:
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(TotemAtendimento.data_hora <= data_fim_obj)
        
        atendimentos = query.order_by(TotemAtendimento.data_hora.desc()).all()
        
        resultado = []
        for atendimento in atendimentos:
            resultado.append({
                'id': atendimento.id,
                'data_hora': atendimento.data_hora.strftime('%Y-%m-%d %H:%M:%S'),
                'atendente': atendimento.atendente,
                'quantidade_tickets': atendimento.quantidade_tickets
            })
        
        return jsonify({'atendimentos': resultado}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Cliente conectado')
    socketio.emit('ticket_atualizado', {'ticket_atual': ticket_atual})
    socketio.emit('ticket_impresso_atualizado', {'ticket_impresso': ticket_number})


@socketio.on('novo_ticket_chamado')
def handle_novo_ticket_chamado(data):
    if data['attendantName'] == 'ERIVELTON':
        data['attendantName'] = 'ZEN'
    
    tickets_por_atendente[data['attendantName']] += 1

    # Adicione o log do guichê
    print(f'{data["attendantName"]} no guichê {data.get("guiche", "N/A")} chamou mais um ticket. Total atual: {tickets_por_atendente[data["attendantName"]]}')
    print(f'Novo ticket chamado: {data}')
    
    socketio.emit('novo_ticket_chamado', data)

def salvar_dados():
    global ticket_number, ticket_atual
    
    with app.app_context():
        if not tickets_por_atendente:
            print('Sem tickets para salvar')
            return

        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Verificar se a conexão está ativa
                db.session.execute(text('SELECT 1'))
                
                for atendente, quantidade in tickets_por_atendente.items():
                    novo_atendimento = TotemAtendimento(
                        atendente=atendente,
                        quantidade_tickets=quantidade,
                        data_hora=datetime.now()
                    )
                    db.session.add(novo_atendimento)
                
                db.session.commit()
                print(f"Dados salvos no banco de dados: {dict(tickets_por_atendente)}")
                
                # Limpar dados apenas após sucesso
                tickets_por_atendente.clear()
                ticket_number = 0
                ticket_atual = 0
                print('Número de tickets resetado para 0')
                break
                
            except OperationalError as e:
                retry_count += 1
                print(f"Tentativa {retry_count} falhou: {str(e)}")
                
                try:
                    db.session.rollback()
                    db.session.close()  # Fechar conexão problemática
                except:
                    pass
                
                if retry_count < max_retries:
                    print(f"Tentando novamente em 5 segundos...")
                    time.sleep(5)
                    # Criar nova sessão
                    db.session.remove()
                else:
                    print("Todas as tentativas falharam. Dados não foram salvos.")
                    
            except Exception as e:
                try:
                    db.session.rollback()
                except:
                    pass
                print(f"Erro inesperado ao salvar dados: {str(e)}")
                break

scheduler = BackgroundScheduler()
scheduler.add_job(salvar_dados, 'cron', hour=12, minute=0)
scheduler.add_job(salvar_dados, 'cron', hour=18, minute=0)

if __name__ == '__main__':
   scheduler.start()
   app.run(debug=True, host='0.0.0.0', port=9000)