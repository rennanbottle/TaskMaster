// =====================================================================
// script-mobile.js
// Lógica da versão mobile do Task Master.
// Usa os MESMOS conceitos do site (DOM, addEventListener, fetch) e a
// MESMA API do backend — a diferença entre mobile e web está no HTML/CSS
// (layout, tamanho de botão), não na lógica de JavaScript.
// =====================================================================

console.log('Task Master Mobile carregado');

// ---------------------------------------------------------------------
// CONFIGURAÇÃO
// ---------------------------------------------------------------------
// Endereço do backend. window.location.origin funciona tanto no Codespace
// quanto quando o projeto estiver publicado (melhor que localhost fixo).
const URL_API = window.location.origin;

// MODO_DEMONSTRACAO = true  -> usa dados fictícios na memória do próprio
//                              JavaScript, sem precisar do backend pronto.
//                              Serve para eu montar e testar minha tela
//                              ANTES de esperar o /auth do Douglas.
// MODO_DEMONSTRACAO = false -> usa fetch() de verdade contra o backend.
// Quando o backend + /auth estiverem prontos, troque para false.
const MODO_DEMONSTRACAO = true;

// "Banco de dados" falso, só pro modo demonstração.
let tarefasDemo = [
  { id: 1, titulo: 'Estudar pra prova de JS', concluida: false },
  { id: 2, titulo: 'Terminar a tela mobile', concluida: false },
  { id: 3, titulo: 'Testar o login', concluida: true },
];
let proximoIdDemo = 4;

// Guarda o token recebido no login (fica só na memória, some se recarregar
// a página — isso é o suficiente pro que o professor pediu).
let tokenAtual = null;

// ---------------------------------------------------------------------
// REFERÊNCIAS DOS ELEMENTOS DO HTML
// (document.getElementById busca pelo "id" que está no index.html)
// ---------------------------------------------------------------------
const telaLogin = document.getElementById('tela-login');
const telaCadastro = document.getElementById('tela-cadastro');
const telaTarefas = document.getElementById('tela-tarefas');

const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');
const formNovaTarefa = document.getElementById('form-nova-tarefa');

const listaTarefasEl = document.getElementById('lista-tarefas');
const avisoDemoEl = document.getElementById('aviso-demo');

// ---------------------------------------------------------------------
// TROCA DE TELA
// Em vez de ter 3 páginas HTML separadas, escondemos/mostramos <section>
// usando a classe "escondida" (display: none no CSS).
// ---------------------------------------------------------------------
function mostrarTela(tela) {
  [telaLogin, telaCadastro, telaTarefas].forEach((t) => t.classList.add('escondida'));
  tela.classList.remove('escondida');
}

document.getElementById('btn-ir-cadastro').addEventListener('click', () => mostrarTela(telaCadastro));
document.getElementById('btn-ir-login').addEventListener('click', () => mostrarTela(telaLogin));

document.getElementById('btn-sair').addEventListener('click', () => {
  tokenAtual = null;
  mostrarTela(telaLogin);
});

// ---------------------------------------------------------------------
// CADASTRO — POST /auth/register { nome, email, senha }
// ---------------------------------------------------------------------
formCadastro.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // impede o navegador de recarregar a página (comportamento padrão de <form>)

  const nome = document.getElementById('cad-nome').value;
  const email = document.getElementById('cad-email').value;
  const senha = document.getElementById('cad-senha').value;
  const erroEl = document.getElementById('cadastro-erro');
  erroEl.textContent = '';

  if (MODO_DEMONSTRACAO) {
    // No modo demo não existe backend de verdade: só simula sucesso.
    alert('Modo demonstração: cadastro simulado com sucesso. Faça login.');
    mostrarTela(telaLogin);
    return;
  }

  try {
    const resposta = await fetch(`${URL_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      erroEl.textContent = erro.erro || 'Não foi possível cadastrar.';
      return;
    }

    alert('Cadastro feito! Agora faça login.');
    mostrarTela(telaLogin);
  } catch (erro) {
    erroEl.textContent = 'Não consegui falar com o servidor. Ele está rodando?';
  }
});

// ---------------------------------------------------------------------
// LOGIN — POST /auth/login { email, senha } -> { token }
// ---------------------------------------------------------------------
formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;
  const erroEl = document.getElementById('login-erro');
  erroEl.textContent = '';

  if (MODO_DEMONSTRACAO) {
    // Qualquer e-mail/senha "loga" no modo demo.
    tokenAtual = 'token-falso-de-demonstracao';
    avisoDemoEl.classList.remove('escondida');
    entrarNaTelaDeTarefas();
    return;
  }

  try {
    const resposta = await fetch(`${URL_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!resposta.ok) {
      erroEl.textContent = 'E-mail ou senha inválidos.';
      return;
    }

    const dados = await resposta.json();
    tokenAtual = dados.token;
    avisoDemoEl.classList.add('escondida');
    entrarNaTelaDeTarefas();
  } catch (erro) {
    erroEl.textContent = 'Não consegui falar com o servidor. Ele está rodando?';
  }
});

async function entrarNaTelaDeTarefas() {
  mostrarTela(telaTarefas);
  await carregarTarefas();
}

// ---------------------------------------------------------------------
// LISTAR TAREFAS — GET /tasks (com Authorization: Bearer <token>)
// ---------------------------------------------------------------------
async function carregarTarefas() {
  let tarefas;

  if (MODO_DEMONSTRACAO) {
    tarefas = tarefasDemo;
  } else {
    const resposta = await fetch(`${URL_API}/tasks`, {
      headers: { Authorization: `Bearer ${tokenAtual}` },
    });
    tarefas = await resposta.json();
  }

  desenharListaDeTarefas(tarefas);
}

// Recebe a lista de tarefas (array) e monta os <li> na tela.
// Isso é "manipulação do DOM": criar elementos por JavaScript em vez
// de escrevê-los fixos no HTML.
function desenharListaDeTarefas(tarefas) {
  listaTarefasEl.innerHTML = ''; // limpa a lista antes de redesenhar

  tarefas.forEach((tarefa) => {
    const item = document.createElement('li');
    if (tarefa.concluida) item.classList.add('concluida');

    const texto = document.createElement('span');
    texto.textContent = tarefa.titulo;

    const btnConcluir = document.createElement('button');
    btnConcluir.classList.add('concluir');
    btnConcluir.textContent = '✓';
    btnConcluir.addEventListener('click', () => concluirTarefa(tarefa.id));

    const btnRemover = document.createElement('button');
    btnRemover.classList.add('remover');
    btnRemover.textContent = '✕';
    btnRemover.addEventListener('click', () => removerTarefa(tarefa.id));

    item.append(texto, btnConcluir, btnRemover);
    listaTarefasEl.appendChild(item);
  });
}

// ---------------------------------------------------------------------
// CRIAR TAREFA — POST /tasks { titulo }
// ---------------------------------------------------------------------
formNovaTarefa.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const inputEl = document.getElementById('input-nova-tarefa');
  const titulo = inputEl.value.trim();
  if (!titulo) return;

  if (MODO_DEMONSTRACAO) {
    tarefasDemo.push({ id: proximoIdDemo++, titulo, concluida: false });
  } else {
    await fetch(`${URL_API}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAtual}`,
      },
      body: JSON.stringify({ titulo }),
    });
  }

  inputEl.value = '';
  await carregarTarefas();
});

// ---------------------------------------------------------------------
// CONCLUIR TAREFA — PATCH /tasks/:id
// ---------------------------------------------------------------------
async function concluirTarefa(id) {
  if (MODO_DEMONSTRACAO) {
    const tarefa = tarefasDemo.find((t) => t.id === id);
    if (tarefa) tarefa.concluida = true;
  } else {
    await fetch(`${URL_API}/tasks/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenAtual}` },
    });
  }
  await carregarTarefas();
}

// ---------------------------------------------------------------------
// REMOVER TAREFA — DELETE /tasks/:id
// ---------------------------------------------------------------------
async function removerTarefa(id) {
  if (MODO_DEMONSTRACAO) {
    tarefasDemo = tarefasDemo.filter((t) => t.id !== id);
  } else {
    await fetch(`${URL_API}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenAtual}` },
    });
  }
  await carregarTarefas();
}