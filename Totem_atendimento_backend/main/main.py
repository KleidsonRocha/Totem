from flask import Flask, request, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import A4, A3
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.units import mm
import win32print
import win32api
import os
import tempfile
import time
import datetime

app = Flask(__name__)
CORS(app)

# Configura a impressora
lista_impressora = win32print.EnumPrinters(2)

print(lista_impressora)

impressora = lista_impressora[1]

print(impressora)

win32print.SetDefaultPrinter(impressora[2])

@app.route('/salvar_ticket', methods=['POST'])
def salvar_ticket():
   try:
      if not request.json or 'quantidade_ticket' not in request.json:
         return jsonify({'error': 'Número de ticket inexistente'}), 400

      QTDtickets = request.json['quantidade_ticket']

      # Obter o timestamp atual
      timestamp = datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')

      # Salvar a quantidade de tickets e o timestamp no arquivo
      with open('tickets_log.txt', 'a') as file:
         if(QTDtickets == 0):
            return
         else:
            file.write(f'{timestamp} - Quantidade de tickets: {QTDtickets}\n')

      return jsonify({'message': 'Quantidade de tickets salva com sucesso'}), 200

   except Exception as e:
      return jsonify({'error': str(e)}), 500


@app.route('/imprimir_atendimento', methods=['POST'])
def imprimir_atendimento():
   try:
      # Verifica se as informações necessárias foram enviadas no JSON
      if not request.json or 'numero' not in request.json:
         return jsonify({'error': 'Número de atendimento não enviado'}), 400

      numero_atendimento = request.json['numero']

      # Configura o caminho do arquivo temporário para o PDF
      caminho_temp = os.path.join(tempfile.gettempdir(), f"atendimento_{numero_atendimento}.pdf")

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
      estilo_titulo.fontSize = 120
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
      elements.append(Paragraph(f"{numero_atendimento}", estilo_titulo))
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
      print(caminho_temp)
      os.remove(caminho_temp)

      return jsonify({'message': 'PDF gerado e impresso com sucesso!'}), 200

   except Exception as e:
      return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
   app.run(debug=True, host='0.0.0.0', port=9000)
