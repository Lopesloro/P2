// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Backend da tela de Detalhes da Demanda

import express from "express"

const app = express()

// Permite ler o JSON que a tela envia nas requisicoes
app.use(express.json())

// Entrega o HTML, o CSS e o JS da pasta
app.use(express.static("."))

// Nome de quem esta usando o sistema
const usuario = "Eduardo Martins Colmati"

// Dados da demanda. Ficam nesta variavel porque o projeto ainda nao tem
// banco de dados. Ao desligar o servidor eles voltam a ser estes.
const demanda = {
    status: "Em andamento",
    comentarios: [
        { autor: "Jose Gabriel Bedani", data: "18/08/2026 as 09:14", texto: "O erro acontece porque o campo espera ponto no lugar da virgula. Precisamos aceitar os dois formatos." },
        { autor: "Gustavo de Oliveira de Santana", data: "18/08/2026 as 14:02", texto: "Consegui reproduzir aqui no meu ambiente. Vou comecar a correcao hoje." },
        { autor: "Gabriel Lopes Londe Rodrigues", data: "19/08/2026 as 10:37", texto: "Vale conferir tambem a tela de lancamento de faltas, que usa o mesmo componente de campo numerico." }
    ],
    historico: [
        { texto: "Status alterado de Aberta para Em andamento", autor: "Gustavo de Oliveira de Santana", data: "18/08/2026 as 13:58" },
        { texto: "Responsavel definido como Gustavo de Oliveira de Santana", autor: "Jose Gabriel Bedani", data: "18/08/2026 as 09:20" },
        { texto: "Demanda cadastrada no sistema", autor: "Eduardo Martins Colmati", data: "17/08/2026 as 16:45" }
    ]
}

// Ordem do ciclo de vida, definida no Documento de Visao.
// A demanda nao pode pular etapas: para ser concluida ela precisa passar
// por Em revisao. Cancelar encerra a demanda a partir de qualquer ponto.
const ordem = ["Aberta", "Em andamento", "Em revisao", "Concluida"]

// Diz para quais status a demanda pode ir a partir do status atual
function proximosStatus(atual) {

    // Demanda encerrada nao muda mais de status
    if (atual === "Concluida" || atual === "Cancelada") {
        return []
    }

    return [ordem[ordem.indexOf(atual) + 1], "Cancelada"]
}

// Devolve a data e a hora de agora, no formato 20/09/2026 as 14:32
function agora() {
    const d = new Date()
    return d.toLocaleDateString("pt-BR") + " as " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

// Envia a demanda para a tela
app.get("/api/demanda", (req, res) => {
    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Registra um comentario novo
app.post("/api/comentarios", (req, res) => {
    const texto = req.body.texto

    // O trim remove os espacos do comeco e do fim
    if (!texto || texto.trim() === "") {
        return res.status(400).json({ erro: "Escreva o comentario antes de enviar." })
    }

    demanda.comentarios.push({ autor: usuario, data: agora(), texto: texto.trim() })

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Muda o status da demanda
app.patch("/api/status", (req, res) => {
    const novo = req.body.status

    // A tela ja mostra so os botoes permitidos, mas a conferencia e feita
    // aqui tambem: quem chamar a rota por fora do navegador fica barrado
    if (!proximosStatus(demanda.status).includes(novo)) {
        return res.status(400).json({ erro: "Esta demanda nao pode passar para " + novo + "." })
    }

    demanda.historico.unshift({
        texto: "Status alterado de " + demanda.status + " para " + novo,
        autor: usuario,
        data: agora()
    })

    demanda.status = novo

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

app.listen(3000, () => {
    console.log("Servidor aberto em http://localhost:3000")
})
