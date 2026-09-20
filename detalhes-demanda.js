// Autor do arquivo: Gabriel Lopes Londe Rodrigues

// Elementos usados no codigo
const etiqueta_status = document.querySelector("#etiqueta_status")
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

// Desenha na tela os dados que vieram do servidor
function mostrar(dados) {
    const demanda = dados.demanda

    // Status, no topo da tela. A classe muda a cor da etiqueta.
    etiqueta_status.textContent = demanda.status
    etiqueta_status.className = "etiqueta " + demanda.status.toLowerCase().replace(" ", "-")
    status_atual.textContent = "Status atual: " + demanda.status + ". Escolha o proximo passo."

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

    demanda.historico.forEach((h) => {
        const li = document.createElement("li")
        li.innerHTML = h.texto + "<span class='data'>" + h.autor + " - " + h.data + "</span>"
        lista_historico.appendChild(li)
    })
}

// Busca os dados no servidor quando a pagina abre
async function carregar() {
    const resposta = await fetch("/api/demanda")
    mostrar(await resposta.json())
}

// Muda o status da demanda
async function mudarStatus(status) {
    const resposta = await fetch("/api/status", {
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

    const resposta = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: campo_comentario.value })
    })

    campo_comentario.value = ""
    mostrar(await resposta.json())
})

// Volta para a tela anterior. O history.back leva de volta de onde a
// pessoa veio. Quando nao ha tela anterior, porque a pagina foi aberta
// direto por um link, o link da listagem e usado como destino.
voltar.addEventListener("click", (e) => {
    if (history.length > 1) {
        e.preventDefault()
        history.back()
    }
})

carregar()
