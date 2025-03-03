## Descrição
Este projeto tem como objetivo criar um sistema de impressão de ticket de forma customizavel. Ele pode atender as dimensões de qualquer impressora, podendo tambem
as necessidade de coleta de dados dos atendentes para produção de relatorios posteriores

## Funcionalidades
- Emissão de senhas
- Impressão de tickets personalizaveis
- Relatorios de atendimentos

## Como Rodar | Instalação do Ambiente Virtual

## Pré-requisitos
- Node.js instalado
- NPM instalado

### Passos para criação do ambiente virtual do backEnd
1. Navegue até o diretório do projeto:
  ```bash
  cd totem-atendimento
  ```
2. Crie o ambiente virtual:
  ```bash
  python -m venv venv
  ```
3. Ative o ambiente virtual:
  - No Windows:
    ```bash
    .\venv\Scripts\activate
    ```
  - No macOS e Linux:
    ```bash
    source venv/bin/activate
    ```
4. Instale as dependências:
  ```bash
  pip install -r requirements.txt
  ```


### Passos para execução
1. Clone o repositório:
  ```bash
  git clone https://github.com/seu-usuario/totem-atendimento.git
  ```
2. Navegue até o diretório do projeto:
  ```bash
  cd totem-atendimento
  ```
3. Instale as dependências do front end:
  ```bash
  cd Totem_atendimento_frontend
  npm install
  npm run dev
  ```
4. Instale as dependências do back end:
  ```bash
  cd Totem_atendimento_backend
  .venv\Scripts\activate.bat
  python main\main.py
  ```

O projeto estará rodando em `http://localhost:3000`.

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça o push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

