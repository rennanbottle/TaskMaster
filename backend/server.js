const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const app = express();
let sessoes = {};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend-web')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend-web', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// O banco de dados em mémoria como pedido, uma lista de tarefas
let tarefas = []; // Uma array vázia de começo
let usuarios = [];
let proximoUsuarioId = 1;
let proximoId = 1;

function verificarLogin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !sessoes[token]) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  req.usuarioId = sessoes[token]; // guarda o id do usuário logado pra rota usar depois
  next(); // libera a passagem
}

// GET /tasks -> devolve a lista inteira de tarefa em JSON
app.get('/tasks', verificarLogin, (req, res) => {
  res.status(200).json(tarefas);
});
app.post('/tasks', verificarLogin, (req, res) => {
  const titulo = req.body.titulo;   // Quarda na memória a váriavel que foi recebida

  const novaTarefa = {              // monta ficha da tarefa nova
    id: proximoId++,
    titulo: titulo,
    concluida: false
  };
  tarefas.push(novaTarefa);         // adiciona a ficha na lousa tarefas

  res.status(201).json(novaTarefa); // Devolve a nova tarefa criada com o status 201 e convetida em json
});

app.delete('/tasks/:id', verificarLogin, (req, res) => {
  const id = Number(req.params.id); // Filtras os dados que pasarão, como se fosse uma penneira bem complexa, que só deixa passar o que definido a ser passado

  tarefas = tarefas.filter((tarefa) => tarefa.id !== id); // Apaga as lista que não tiverem um id tipo mostrando me envia lista = [maçâ, uva], mas depois me envia list = [maçã], como não tem o id uva ela vai ser apagada.

  res.status(200).json({ mensagem: 'Tarefa removida com sucesso' });
})

app.patch('/tasks/:id', verificarLogin, (req, res) => {
  const id = Number(req.params.id);

  const tarefa = tarefas.find((tarefa) => tarefa.id === id);

  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa não encontrada' }); // Verifica se o tarefa for difente de id será exibido uma mensagem "erro: tarefa não encontrada" fazendo com que o resto do código a baixo dele dentro do rode tipo um break
  }

  tarefa.concluida = true;

  res.status(200).json(tarefa);
});

app.post('/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body; // Forma mais simples de pegar os campos do body em vez de digitar um por um, "req.body.nome, req.body.email e req.body.senha".

  const senhaHash = await bcrypt.hash(senha, 10);

  const novoUsuario = {
    id: proximoUsuarioId++,
    nome: nome,
    email: email,
    senhaHash: senhaHash
  };

  usuarios.push(novoUsuario)

  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
});

app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find((usuario) => usuario.email === email);

  if (!usuario) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }
  const token = crypto.randomUUID();
  sessoes[token] = usuario.id;

  res.status(200).json({ token: token });
});