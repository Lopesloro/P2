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

// As demandas sao as mesmas seis que aparecem na tela de listagem, com os
// mesmos valores de exemplo. Elas ficam nesta variavel porque o projeto
// ainda nao tem banco de dados, entao ao desligar o servidor os dados
// voltam a ser estes.
//
// O campo status e o unico que nao copia a listagem. La ele tambem esta
// escrito "Exemplo A", mas aqui ele precisa de um valor de verdade, senao
// nao da para conferir o ciclo de vida da demanda mais abaixo.
//
// Os comentarios e o historico comecam vazios: a listagem nao tem essas
// informacoes, entao nao havia de onde tira-las.
const demandas = [
    { id: 1, titulo: "Exemplo A", tipo: "Exemplo A", prioridade: "Exemplo A", status: "Aberta", projeto: "Exemplo A", responsavel: "Exemplo A", criacao: "Exemplo A", prazo: "Exemplo A", descricao: "Exemplo A", comentarios: [], historico: [] },
    { id: 2, titulo: "Exemplo B", tipo: "Exemplo B", prioridade: "Exemplo B", status: "Em andamento", projeto: "Exemplo B", responsavel: "Exemplo B", criacao: "Exemplo B", prazo: "Exemplo B", descricao: "Exemplo B", comentarios: [], historico: [] },
    { id: 3, titulo: "Exemplo C", tipo: "Exemplo C", prioridade: "Exemplo C", status: "Em revisao", projeto: "Exemplo C", responsavel: "Exemplo C", criacao: "Exemplo C", prazo: "Exemplo C", descricao: "Exemplo C", comentarios: [], historico: [] },
    { id: 4, titulo: "Exemplo D", tipo: "Exemplo D", prioridade: "Exemplo D", status: "Concluida", projeto: "Exemplo D", responsavel: "Exemplo D", criacao: "Exemplo D", prazo: "Exemplo D", descricao: "Exemplo D", comentarios: [], historico: [] },
    { id: 5, titulo: "Exemplo E", tipo: "Exemplo E", prioridade: "Exemplo E", status: "Cancelada", projeto: "Exemplo E", responsavel: "Exemplo E", criacao: "Exemplo E", prazo: "Exemplo E", descricao: "Exemplo E", comentarios: [], historico: [] },
    { id: 6, titulo: "Exemplo F", tipo: "Exemplo F", prioridade: "Exemplo F", status: "Aberta", projeto: "Exemplo F", responsavel: "Exemplo F", criacao: "Exemplo F", prazo: "Exemplo F", descricao: "Exemplo F", comentarios: [], historico: [] }
]

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

// Procura uma demanda pelo numero
function procurar(id) {
    return demandas.find((d) => d.id === Number(id))
}

// Devolve a data e a hora de agora, no formato 21/09/2026 as 14:32
function agora() {
    const d = new Date()
    return d.toLocaleDateString("pt-BR") + " as " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

// Envia a demanda para a tela
app.get("/api/demanda/:id", (req, res) => {
    const demanda = procurar(req.params.id)

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Registra um comentario novo
app.post("/api/demanda/:id/comentarios", (req, res) => {
    const demanda = procurar(req.params.id)
    const texto = req.body.texto

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    // O trim remove os espacos do comeco e do fim
    if (!texto || texto.trim() === "") {
        return res.status(400).json({ erro: "Escreva o comentario antes de enviar." })
    }

    demanda.comentarios.push({ autor: usuario, data: agora(), texto: texto.trim() })

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Muda o status da demanda
app.patch("/api/demanda/:id/status", (req, res) => {
    const demanda = procurar(req.params.id)
    const novo = req.body.status

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

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
