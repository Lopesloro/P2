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
// A lista comeca com seis demandas de exemplo, criadas logo abaixo pela
// funcao demandasDeExemplo. Elas existem para o sistema ter o que mostrar
// enquanto a tela de cadastro ainda nao envia nada, e foram escolhidas
// para cobrir os cinco status do ciclo de vida: assim da para demonstrar
// cada situacao sem precisar preparar nada antes.
//
// Todas podem ser usadas normalmente: da para comentar, mudar o status e
// acompanhar o historico, como se fossem demandas de verdade.
//
// A lista fica em uma variavel porque o projeto ainda nao tem banco de
// dados. Ao reiniciar o servidor ela volta a ser estas seis.
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

// Fuso horario de Brasilia.
//
// O servidor onde o sistema esta publicado roda no horario de Londres, e
// sem esta linha as datas apareciam tres horas adiantadas. Dizer o fuso
// aqui resolve para o sistema inteiro, esteja ele publicado ou rodando na
// propria maquina.
const FUSO = "America/Sao_Paulo"

// Devolve a data e a hora de agora, no formato 21/09/2026 as 14:32
function agora() {
    const d = new Date()
    const data = d.toLocaleDateString("pt-BR", { timeZone: FUSO })
    const hora = d.toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" })
    return data + " as " + hora
}

// Devolve a data daqui a tantos dias, no formato 2026-10-15.
//
// Os prazos das demandas de exemplo usam esta funcao em vez de datas
// escritas a mao, para continuarem fazendo sentido com o passar do tempo:
// o que vence em tres dias hoje vai continuar vencendo em tres dias
// daqui a um mes.
function emDias(quantidade) {
    const d = new Date()
    d.setDate(d.getDate() + quantidade)
    return d.toISOString().slice(0, 10)
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
/* ---------------------------------------------------------------------
   DEMANDAS DE EXEMPLO

   Criadas quando o servidor sobe, para o sistema nao comecar vazio.
   Quando a tela de cadastro estiver ligada, estas seis podem sair e o
   sistema passa a viver so do que for cadastrado.
   --------------------------------------------------------------------- */
function demandasDeExemplo() {
    const lista = [
        {
            titulo: "Corrigir erro ao salvar nota com virgula",
            descricao: "Ao lancar uma nota usando virgula como separador, por exemplo 7,5, o sistema mostra erro e nao grava. Com ponto, 7.5, grava normalmente.",
            projeto: "Portal do Aluno",
            responsavel: "Gustavo de Oliveira de Santana",
            tipo: "Defeito", prioridade: "Critica", status: "Em andamento",
            prazo: emDias(3)
        },
        {
            titulo: "Criar tela de consulta de faltas",
            descricao: "O aluno precisa ver quantas faltas tem em cada materia e quantas ainda pode ter antes de reprovar por frequencia.",
            projeto: "Portal do Aluno",
            responsavel: "Gabriel Lopes Londe Rodrigues",
            tipo: "Tarefa", prioridade: "Alta", status: "Aberta",
            prazo: emDias(12)
        },
        {
            titulo: "Corrigir contagem de exemplares disponiveis",
            descricao: "A quantidade de exemplares nao diminui quando o livro e emprestado, entao o sistema permite reservar um livro que ja saiu.",
            projeto: "Aplicativo de Biblioteca",
            responsavel: "",
            tipo: "Defeito", prioridade: "Alta", status: "Em revisao",
            prazo: emDias(6)
        },
        {
            titulo: "Melhorar desempenho da listagem de notas",
            descricao: "A listagem demora cerca de oito segundos para abrir quando a turma tem mais de quarenta alunos.",
            projeto: "Portal do Aluno",
            responsavel: "Gustavo de Oliveira de Santana",
            tipo: "Melhoria", prioridade: "Media", status: "Concluida",
            prazo: emDias(-4)
        },
        {
            titulo: "Ajustar layout do menu no celular",
            descricao: "No celular o menu cobre o conteudo da pagina e nao fecha ao tocar fora dele.",
            projeto: "Site Institucional",
            responsavel: "Gabriel Lopes Londe Rodrigues",
            tipo: "Defeito", prioridade: "Media", status: "Cancelada",
            prazo: ""
        },
        {
            titulo: "Escrever manual do bibliotecario",
            descricao: "Documentar o cadastro de livros, o registro de emprestimo e a devolucao, com telas de exemplo.",
            projeto: "Aplicativo de Biblioteca",
            responsavel: "",
            tipo: "Documentacao", prioridade: "Baixa", status: "Aberta",
            prazo: emDias(25)
        }
    ]

    lista.forEach((dados) => {
        demandas.push({
            id: proximoNumero,
            titulo: dados.titulo,
            descricao: dados.descricao,
            projeto: dados.projeto,
            tipo: dados.tipo,
            prioridade: dados.prioridade,
            status: dados.status,
            responsavel: dados.responsavel,
            prazo: dados.prazo,
            criacao: agora(),
            comentarios: [],
            historico: [
                { texto: "Demanda cadastrada no sistema", autor: usuario, data: agora() }
            ]
        })

        proximoNumero = proximoNumero + 1
    })
}

demandasDeExemplo()

// Abrir o endereco do site leva direto para a listagem de demandas, que e
// por onde se comeca a usar o sistema.
rotas.get("/", (req, res) => {
    res.redirect("/listagem.html")
})

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
