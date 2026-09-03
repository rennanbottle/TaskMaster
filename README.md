# Estrutura de Pastas
```
TaskMaster_Projeto_Avaliativo/
├── README.md                  # Documentação do projeto, enunciados e rubrica de avaliação
├── .gitignore                 # Dizer quais arquivos devem ser ignorados pelo git
├── backend/                   # Módulo da API e Regras de Segurança
│   ├── package.json           # Dependências do Node.js (express, bcryptjs, cors)
│   └── server.js              # Código do servidor, rotas REST e criptografia
├── frontend-web/              # Interface para Desktop/Navegador
│   ├── index.html             # Estrutura HTML da aplicação Web
│   ├── style.css              # Estilização CSS responsiva Web
│   └── app.js                 # Integração JavaScript/Fetch para Web
└── mobile/                    # Interface otimizada para Dispositivos Móveis
    ├── index.html             # Layout mobile em formato de aplicativo
    ├── style-mobile.css       # Estilização focada em telas de toque
    └── script-mobile.js       # Lógica e requisições focadas na experiência mobile
```

# Metodo para iniciar sistema
Aviso: O npm start e node server.js devem ser rodados no terminal, mas dentro da pasta backend por conta do package.json.

- cd backend/cd backend/         - Para entrar dentro da pasta backend pelo terminal
- npm install                    - Para instalar dependências
- npm start ou node server.js    - Os comandos tem a mesma função de rodam o sistema localmente na porta principal, sendo "npm start" um atalho criado no package.json para não digitar toda hora que for rodar "node server.js"

## Requisitos Mínimos

- node.js            - Ter o node.js instalado na sua máquina
- navergador         - Podendo ser qualquer um que esteja definido como navegador principal do sistema

## Status HTTP usados

| Código | Significado | Quando usamos |
|---|---|---|
| `200` | Tudo bem, ok | Listar, remover, atualizar com sucesso |
| `201` | Criado | Depois de um POST que criou algo novo |
| `404` | Não encontrado | Tentei dar PATCH/DELETE num id que não existe |
| `500` | Erro no servidor | Bug no próprio código (ex: variável não definida) |