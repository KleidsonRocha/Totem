# Totem Atendimento
## Instalação do Ambiente Virtual

### Pré-requisitos
- Python instalado

### Passos para criação do ambiente virtual
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
## Descrição
Este projeto é um sistema de atendimento automatizado utilizando um totem interativo. Ele permite que os usuários realizem diversas operações de forma autônoma.

## Funcionalidades
- Consulta de informações
- Agendamento de serviços
- Emissão de senhas
- Atendimento personalizado

## Como Rodar

### Pré-requisitos
- Node.js instalado
- NPM instalado

### Passos para execução
1. Clone o repositório:
  ```bash
  git clone https://github.com/seu-usuario/totem-atendimento.git
  ```
2. Navegue até o diretório do projeto:
  ```bash
  cd totem-atendimento
  ```
3. Instale as dependências:
  ```bash
  npm install
  ```
4. Inicie o servidor:
  ```bash
  npm start
  ```

O projeto estará rodando em `http://localhost:3000`.

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça o push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.