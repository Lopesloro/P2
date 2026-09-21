// Autor do arquivo: Gabriel Lopes Londe Rodrigues

// Elementos usados no codigo
const titulo = document.querySelector("#titulo")
const etiqueta_status = document.querySelector("#etiqueta_status")
const etiqueta_prioridade = document.querySelector("#etiqueta_prioridade")
const etiqueta_tipo = document.querySelector("#etiqueta_tipo")
const descricao = document.querySelector("#descricao")
const ficha = document.querySelector("#ficha")
const status_atual = document.querySelector("#status_atual")
const secao_acoes = document.querySelector("#secao_acoes")
const botoes_status = document.querySelector("#botoes_status")
const lista_comentarios = document.querySelector("#lista_comentarios")
const contador = document.querySelector("#contador")
const lista_historico = document.querySelector("#lista_historico")
const form_comentario = document.querySelector("#form_comentario")
const campo_comentario = document.querySelector("#comentario")
const erro_comentario = document.querySelector("#erro_comentario")
const voltar = document.querySelector("#voltar")

// Numero da demanda, lido do endereco da pagina:
// detalhes-demanda.html?id=3 abre a terceira demanda da listagem.
// Sem numero nenhum, abre a primeira.
const id = new URLSearchParams(window.location.search).get("id") || "1"

// Desenha na tela os dados que vieram do servidor
function mostrar(dados) {
    const demanda = dados.demanda

    // Dados que vem da listagem
    titulo.textContent = demanda.titulo
    descricao.textContent = demanda.descricao
    etiqueta_prioridade.textContent = demanda.prioridade
    etiqueta_tipo.textContent = demanda.tipo

    // Status. A classe muda a cor da etiqueta.
    etiqueta_status.textContent = demanda.status
    etiqueta_status.className = "etiqueta " + demanda.status.toLowerCase().replace(" ", "-")
    status_atual.textContent = "Status atual: " + demanda.status + ". Escolha o proximo passo."

    // Ficha lateral
    ficha.innerHTML = ""

    const campos = [
        ["Numero", "#" + demanda.id],
        ["Projeto", demanda.projeto],
        ["Responsavel", demanda.responsavel]
    ]

    campos.forEach((campo) => {
        const div = document.createElement("div")
        div.innerHTML = "<dt>" + campo[0] + "</dt><dd>" + campo[1] + "</dd>"
        ficha.appendChild(div)
    })

    // Botoes de mudanca de status. Quem diz quais existem e o servidor,
    // por isso nao aparece botao de concluir enquanto a demanda esta em
    // andamento: ela precisa passar por Em revisao antes.
    botoes_status.innerHTML = ""

    // Demanda ja encerrada nao muda mais de status, entao a secao some
    secao_acoes.style.display = dados.proximos.length === 0 ? "none" : "block"

    dados.proximos.forEach((status) => {
        const botao = document.createElement("button")
        botao.className = status === "Cancelada" ? "botao perigo" : "botao principal"
        botao.textContent = status === "Cancelada" ? "Cancelar demanda" : "Mover para " + status
        botao.addEventListener("click", () => mudarStatus(status))
        botoes_status.appendChild(botao)
    })

    // Comentarios
    contador.textContent = "(" + demanda.comentarios.length + ")"
    lista_comentarios.innerHTML = ""

    if (demanda.comentarios.length === 0) {
        lista_comentarios.innerHTML = "<p class='apoio'>Nenhum comentario ainda.</p>"
    }

    demanda.comentarios.forEach((c) => {
        const div = document.createElement("div")
        div.className = "comentario"
        div.innerHTML = "<strong>" + c.autor + "</strong> <span class='data'>" + c.data + "</span>"

        // textContent mostra o texto como texto. Se alguem digitar uma tag
        // HTML no comentario, ela aparece escrita em vez de virar codigo.
        const p = document.createElement("p")
        p.textContent = c.texto
        div.appendChild(p)

        lista_comentarios.appendChild(div)
    })

    // Historico, do mais recente para o mais antigo
    lista_historico.innerHTML = ""

    if (demanda.historico.length === 0) {
        lista_historico.innerHTML = "<p class='apoio'>Nenhuma alteracao registrada.</p>"
    }

    demanda.historico.forEach((h) => {
        const li = document.createElement("li")
        li.innerHTML = h.texto + "<span class='data'>" + h.autor + " - " + h.data + "</span>"
        lista_historico.appendChild(li)
    })
}

// Busca os dados no servidor quando a pagina abre
async function carregar() {
    const resposta = await fetch("/api/demanda/" + id)
    const dados = await resposta.json()

    if (dados.erro) {
        titulo.textContent = dados.erro
        return
    }

    mostrar(dados)
}

// Muda o status da demanda
async function mudarStatus(status) {
    const resposta = await fetch("/api/demanda/" + id + "/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status })
    })

    const dados = await resposta.json()

    if (dados.erro) {
        alert(dados.erro)
        return
    }

    mostrar(dados)
}

// Envia o comentario escrito no campo
form_comentario.addEventListener("submit", async (e) => {

    // Cancela o envio padrao pra nao recarregar a pagina
    e.preventDefault()

    erro_comentario.style.display = "none"

    // O return interrompe a funcao e impede o envio de comentario vazio
    if (campo_comentario.value.trim() === "") {
        erro_comentario.textContent = "Escreva o comentario antes de enviar."
        erro_comentario.style.display = "block"
        return
    }

    const resposta = await fetch("/api/demanda/" + id + "/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: campo_comentario.value })
    })

    campo_comentario.value = ""
    mostrar(await resposta.json())
})

// Volta para a tela anterior.
//
// O document.referrer guarda o endereco da pagina de onde a pessoa veio.
// Se ela veio de outra tela do sistema, o history.back devolve exatamente
// para la, ja na posicao em que estava.
//
// Quando a pessoa abre esta tela direto, digitando o endereco ou por um
// link colado, o referrer vem vazio. Nesse caso o clique nao e
// interceptado e o navegador segue o link normal do botao, que aponta
// para a listagem.
voltar.addEventListener("click", (e) => {
    if (document.referrer.includes(window.location.host)) {
        e.preventDefault()
        history.back()
    }
})

carregar()
