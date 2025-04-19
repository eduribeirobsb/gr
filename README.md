# 🛡️ Sistema de Gerenciamento de Riscos Contratuais

Este é um sistema web simples para cadastro, avaliação e acompanhamento de riscos relacionados a contratos públicos e administrativos.

## 🚀 Funcionalidades

- 📌 Cadastro de PAs, contratos e objetos
- ⚠️ Registro de riscos com causa, consequência, impacto e probabilidade
- ✅ Cálculo automático do NRI (Nível de Risco)
- 🔐 Login com controle de usuário (adm e ser)
- 📝 Registro de ações preventivas/corretivas para NRI ≥ 8
- 🕵️ Histórico com data de atualização e responsável
- 📄 Geração de relatório em PDF com layout do Bootstrap

## 👥 Usuários padrão

| Usuário | Senha   | Perfil |
|---------|---------|--------|
| `adm`   | `123456`| Admin  |
| `ser`   | `123456`| Servidor |

## 💻 Tecnologias utilizadas

- Node.js + Express
- SQLite3
- EJS (views)
- Bootstrap 5
- HTML-PDF (geração de PDF)

## 🧱 Estrutura de tabelas

- `contratos`: número do PA, contrato, unidade, objeto
- `riscos`: risco, causa, consequência, impacto, probabilidade, NRI
- `acoes`: ações corretivas/preventivas, responsáveis, situação, datas

## ▶️ Como executar

1. Instale as dependências:
npm install

2. Inicie o servidor
node app.js

3. Acesse o servidor
http://localhost:3000

## 📂 Estrutura
├── app.js               # Arquivo principal da aplicação
├── banco.sqlite         # Banco de dados SQLite
├── database.js          # Conexão com o banco de dados
├── .gitignore           # Arquivos ignorados no Git
│
├── /models              # Lógica de acesso ao banco de dados
│   ├── Risco.js
│   └── Acao.js
│
├── /routes              # Rotas da aplicação
│   ├── auth.js          # Login e sessão
│   └── riscos.js        # Cadastro, edição e relatórios de riscos
│
├── /middlewares         # Middleware de autenticação
│   └── auth.js
│
├── /views               # Páginas EJS (interface do usuário)
│   ├── login.ejs
│   ├── riscos.ejs
│   ├── acoes.ejs
│   └── relatorio.ejs
