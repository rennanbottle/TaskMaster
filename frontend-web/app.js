const API_URL = "http://localhost:3000"; // <- vamos trocar esse valor no Passo 3

let tokenAtual = null;

const telaLogin = document.getElementById("telaLogin");
const telaTarefas = document.getElementById("telaTarefas");

const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");
const linkAlternar = document.getElementById("linkAlternar");

const erroLogin = document.getElementById("erroLogin");
const erroCadastro = document.getElementById("erroCadastro");

const inputNovaTarefa = document.getElementById("inputNovaTarefa");
const botaoAdicionar = document.getElementById("botaoAdicionar");
const listaTarefas = document.getElementById("listaTarefas");
const botaoSair = document.getElementById("botaoSair");

linkAlternar.addEventListener("click", function (evento) {
  evento.preventDefault();
  formCadastro.classList.toggle("escondido");
  formLogin.classList.toggle("escondido");

  if (formCadastro.classList.contains("escondido")) {
    linkAlternar.textContent = "Ainda não tem conta? Cadastre-se";
  } else {
    linkAlternar.textContent = "Já tem conta? Entrar";
  }
});

formCadastro.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nome = document.getElementById("cadastroNome").value;
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;

  fetch(API_URL + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: nome, email: email, senha: senha })
  })
    .then(function (resposta) {
      if (!resposta.ok) throw new Error("Não foi possível cadastrar");
      return resposta.json();
    })
    .then(function () {
      erroCadastro.textContent = "";
      formCadastro.classList.add("escondido");
      formLogin.classList.remove("escondido");
      linkAlternar.textContent = "Ainda não tem conta? Cadastre-se";
      document.getElementById("loginEmail").value = email;
    })
    .catch(function (erro) {
      erroCadastro.textContent = "Erro ao cadastrar. Tente outro email.";
      console.error(erro);
    });
});

formLogin.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, senha: senha })
  })
    .then(function (resposta) {
      if (!resposta.ok) throw new Error("Email ou senha incorretos");
      return resposta.json();
    })
    .then(function (dados) {
      tokenAtual = dados.token;
      erroLogin.textContent = "";
      telaLogin.classList.add("escondido");
      telaTarefas.classList.remove("escondido");
      carregarTarefas();
    })
    .catch(function (erro) {
      erroLogin.textContent = "Email ou senha incorretos.";
      console.error(erro);
    });
});

botaoSair.addEventListener("click", function () {
  tokenAtual = null;
  listaTarefas.innerHTML = "";
  telaTarefas.classList.add("escondido");
  telaLogin.classList.remove("escondido");
});

function carregarTarefas() {
  fetch(API_URL + "/tasks", {
    headers: { "Authorization": "Bearer " + tokenAtual }
  })
    .then(function (resposta) { return resposta.json(); })
    .then(function (tarefas) { renderizarTarefas(tarefas); })
    .catch(function (erro) { console.error("Erro ao carregar tarefas:", erro); });
}

function renderizarTarefas(tarefas) {
  listaTarefas.innerHTML = "";

  tarefas.forEach(function (tarefa) {
    const item = document.createElement("li");
    item.className = "item-tarefa" + (tarefa.concluida ? " concluida" : "");

    const titulo = document.createElement("span");
    titulo.className = "titulo-tarefa";
    titulo.textContent = tarefa.titulo;

    const acoes = document.createElement("div");
    acoes.className = "acoes-tarefa";

    const botaoConcluir = document.createElement("button");
    botaoConcluir.textContent = "Concluir";
    botaoConcluir.className = "botao-concluir";
    botaoConcluir.addEventListener("click", function () {
      concluirTarefa(tarefa.id);
    });

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.className = "botao-remover";
    botaoRemover.addEventListener("click", function () {
      removerTarefa(tarefa.id);
    });

    acoes.appendChild(botaoConcluir);
    acoes.appendChild(botaoRemover);
    item.appendChild(titulo);
    item.appendChild(acoes);
    listaTarefas.appendChild(item);
  });
}

botaoAdicionar.addEventListener("click", function () {
  const titulo = inputNovaTarefa.value.trim();
  if (titulo === "") return;

  fetch(API_URL + "/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + tokenAtual
    },
    body: JSON.stringify({ titulo: titulo })
  })
    .then(function (resposta) { return resposta.json(); })
    .then(function () {
      inputNovaTarefa.value = "";
      carregarTarefas();
    })
    .catch(function (erro) { console.error("Erro ao adicionar tarefa:", erro); });
});

function concluirTarefa(id) {
  fetch(API_URL + "/tasks/" + id, {
    method: "PATCH",
    headers: { "Authorization": "Bearer " + tokenAtual }
  })
    .then(function () { carregarTarefas(); })
    .catch(function (erro) { console.error("Erro ao concluir tarefa:", erro); });
}

function removerTarefa(id) {
  fetch(API_URL + "/tasks/" + id, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + tokenAtual }
  })
    .then(function () { carregarTarefas(); })
    .catch(function (erro) { console.error("Erro ao remover tarefa:", erro); });
}
