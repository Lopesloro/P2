// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Rotas do sistema de demandas

import { Router } from "express"

// Um Router e um agrupador de rotas. Ele fica neste arquivo separado para
// as minhas rotas nao precisarem ser escritas dentro do app.js, que e de
// outro integrante da equipe.
export const rotas = Router()

// Nome de quem esta usando o sistema. Quando a tela de login estiver
// ligada, este nome passa a vir de la.
const usuario = "Eduardo Martins Colmati"

// Aqui ficam as demandas do sistema.
//
// A lista comeca VAZIA de proposito. Nao ha nenhuma demanda de exemplo
// escrita no codigo: tudo o que aparecer nas telas vai ter entrado pela
// rota de cadastro, POST /api/demandas.
//
// A lista fica em uma variavel porque o projeto ainda nao tem banco de
// dados. Ao reiniciar o servidor ela volta a ficar vazia.
const demandas = []

// Numero da proxima demanda. Faz o papel que o banco de dados fara
// sozinho mais adiante, com a numeracao automatica.
let proximoNumero = 1

// Ordem do ciclo de vida, definida no Documento de Visao.
// A demanda nao pode pular etapas: para ser concluida ela precisa passar
// por Em revisao. Cancelar encerra a demanda a partir de qualquer ponto.
const ordem = ["Aberta", "Em andamento", "Em revisao", "Concluida"]

/**
 * Tira os acentos de um texto.
 *
 * Por que isso e necessario: a tela de cadastro escreve os status com
 * acento, como "Em revisão" e "Concluída", e as minhas regras usam sem
 * acento. Sem esta funcao, um status vindo de la nao seria reconhecido e
 * a demanda seria recusada. Assim os dois lados combinam sem ninguem
 * precisar mudar a sua tela.
 */
function semAcento(texto) {
    return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "")
}

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

/* ---------------------------------------------------------------------
   LIGACAO ENTRE A LISTAGEM E ESTA TELA

   Cada linha da listagem tem um link "Detalhes" apontando para
   produtodetalhes.html, um arquivo que nunca existiu no projeto. Como
   aquela tela nao e minha, em vez de alterar o arquivo dela eu atendo
   esse endereco aqui e mando o navegador para a tela de Detalhes.

   O link de la ainda nao informa qual demanda foi clicada. Quando
   informar, no formato detalhes.demanda.html?id=1, esta ponte deixa de
   ser necessaria.
   --------------------------------------------------------------------- */
rotas.get("/produtodetalhes.html", (req, res) => {
    res.redirect("/detalhes.demanda.html")
})

/* ---------------------------------------------------------------------
   ROTAS PARA A TELA DE LISTAGEM
   --------------------------------------------------------------------- */

// Devolve todas as demandas, para a listagem montar a tabela
rotas.get("/api/demandas", (req, res) => {
    res.json({ total: demandas.length, demandas: demandas })
})

/* ---------------------------------------------------------------------
   ROTA PARA A TELA DE CADASTRO

   E por aqui que as demandas entram no sistema.
   --------------------------------------------------------------------- */
rotas.post("/api/demandas", (req, res) => {
    const corpo = req.body

    // O titulo aceita os dois nomes porque a tela de cadastro chama o
    // campo de "nome" e o resto do sistema chama de "titulo"
    const titulo = String(corpo.titulo || corpo.nome || "").trim()
    const descricao = String(corpo.descricao || "").trim()
    const projeto = String(corpo.projeto || corpo.associado || "").trim()

    if (titulo === "") {
        return res.status(400).json({ erro: "Informe o titulo da demanda." })
    }

    if (descricao === "") {
        return res.status(400).json({ erro: "Informe a descricao da demanda." })
    }

    // Toda demanda nasce Aberta, salvo se a tela mandar outro status
    const status = corpo.status ? semAcento(corpo.status) : "Aberta"

    if (!ordem.includes(status) && status !== "Cancelada") {
        return res.status(400).json({ erro: "Status desconhecido: " + corpo.status })
    }

    const demanda = {
        id: proximoNumero,
        titulo: titulo,
        descricao: descricao,
        projeto: projeto,
        tipo: corpo.tipo ? String(corpo.tipo) : "",
        prioridade: corpo.prioridade ? String(corpo.prioridade) : "",
        status: status,
        responsavel: corpo.responsavel ? String(corpo.responsavel) : "",
        prazo: corpo.prazo ? String(corpo.prazo) : "",
        criacao: agora(),
        comentarios: [],
        historico: [
            { texto: "Demanda cadastrada no sistema", autor: usuario, data: agora() }
        ]
    }

    demandas.push(demanda)
    proximoNumero = proximoNumero + 1

    res.status(201).json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

/* ---------------------------------------------------------------------
   ROTAS PARA A TELA DE DETALHES
   --------------------------------------------------------------------- */

// Envia uma demanda para a tela
rotas.get("/api/demanda/:id", (req, res) => {
    const demanda = procurar(req.params.id)

    if (!demanda) {

        // Mensagem diferente quando ainda nao ha nenhuma demanda, para a
        // pessoa entender que falta cadastrar, e nao que houve um erro
        if (demandas.length === 0) {
            return res.status(404).json({ erro: "Nenhuma demanda cadastrada ainda." })
        }

        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})

// Registra um comentario novo
rotas.post("/api/demanda/:id/comentarios", (req, res) => {
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
rotas.patch("/api/demanda/:id/status", (req, res) => {
    const demanda = procurar(req.params.id)

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    const novo = semAcento(req.body.status || "")

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

/* ---------------------------------------------------------------------
   ROTA PARA A TELA DE EDICAO
   --------------------------------------------------------------------- */

// Altera os dados da demanda. O status nao muda por aqui: ele tem regras
// proprias e usa a rota de status logo acima.
rotas.put("/api/demanda/:id", (req, res) => {
    const demanda = procurar(req.params.id)
    const corpo = req.body

    if (!demanda) {
        return res.status(404).json({ erro: "Demanda nao encontrada." })
    }

    const campos = ["titulo", "descricao", "projeto", "tipo", "prioridade", "responsavel", "prazo"]

    campos.forEach((campo) => {

        // So altera o que a tela enviou, deixando o resto como estava
        if (corpo[campo] !== undefined) {
            const valor = String(corpo[campo])

            if (demanda[campo] !== valor) {
                demanda.historico.unshift({
                    texto: "Campo " + campo + " alterado",
                    autor: usuario,
                    data: agora()
                })
                demanda[campo] = valor
            }
        }
    })

    res.json({ demanda: demanda, proximos: proximosStatus(demanda.status) })
})
