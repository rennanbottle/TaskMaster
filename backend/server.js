// Código do servidor, rotas REST e criptografia
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Task Master rodando!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// O banco de dados em mémoria, uma lista de tarefas
let tarefas = []; // Uma array vázia de começo
let proximoId = 1;

// GET /tasks -> devolve a lista inteira de tarefa em JSON
app.get('/tasks', (req, res) => {
  res.status(200).json(tarefas);
});

app.post('/tasks', (req, res) => {
  const titulo = req.body.titulo;   // Quarda na memória a váriavel que foi recebida
                              
  const novaTarefa = {              // monta ficha da tarefa nova
    id: proximoId++,
    titulo: titulo,
    concluida: false
  };

  tarefas.push(novaTarefa);         // adiciona a ficha na lousa tarefas

  res.status(201).json(novaTarefa); // Devolve a nova tarefa criada com o status 201 e convetida em json
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id); // Filtras os dados que pasarão, como se fosse uma penneira bem complexa, que só deixa passar o que definido a ser passado

  tarefas = tarefas.filter((tarefa) => tarefa.id !== id); // Apaga as lista que não tiverem um id tipo mostrando me envia lista = [maçâ, uva], mas depois me envia list = [maçã], como não tem o id uva ela vai ser apagada.

  res.status(200).json({ mensagem: 'Tarefa removida com sucesso' });
})

app.patch('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);

  const tarefa = tarefas.find((tarefa) => tarefa.id === id);

  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa não encontrada' }); // Verifica se o tarefa for difente de id será exibido uma mensagem "erro: tarefa não encontrada" fazendo com que o resto do código a baixo dele dentro do rode tipo um break
  } 

  tarefa.concluida = true;

  res.status(200).json(tarefa);
});

