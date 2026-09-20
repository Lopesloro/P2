/**
 * Autor exclusivo deste arquivo: Gabriel Lopes Londe Rodrigues
 *
 * Projeto Integrador II - Engenharia de Software
 * Equipe: PI-II-TIME-11
 * Aluno 5 - Backend da tela de Detalhes da Demanda
 *
 * Este arquivo reune todas as rotas de que a tela de Detalhes precisa:
 * carregar a demanda, escrever um comentario e mudar o status.
 *
 * POR QUE AS ROTAS FICAM AQUI, E NAO DENTRO DO SERVIDOR
 *
 * O repositorio da equipe ja tem um arquivo app.js, que e de outro
 * integrante. Se as minhas rotas fossem escritas la dentro, juntar as
 * partes do sistema significaria mexer no arquivo dele.
 *
 * Separando as rotas em um Router, como esta abaixo, a integracao vira
 * duas linhas dentro do app.js da equipe, sem apagar nada do que ja existe:
 *
 *     import { rotasDetalhes } from './rotas-detalhes.js'
 *     app.use(rotasDetalhes)
 *
 * Um Router e um agrupador de rotas do Express. Ele se comporta como um
 * mini servidor que depois e encaixado no servidor principal.
 *
 * ONDE OS DADOS FICAM GUARDADOS
 *
 * Em um arquivo chamado dados.json, na mesma pasta. Ainda nao existe banco
 * de dados no projeto, e gravar em arquivo tem duas vantagens sobre guardar
 * os dados apenas na memoria do programa: o que for escrito continua la
 * depois de desligar o servidor, e da para abrir o arquivo e ler o conteudo
 * a olho nu, o que ajuda a conferir se uma operacao funcionou.
 *
 * Quando o banco de dados entrar no projeto, so as funcoes lerDados e
 * gravarDados precisam mudar. O resto do arquivo continua igual.
 */

import { Router } from 'express'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const rotasDetalhes = Router()

// Caminho do arquivo de dados, montado a partir da pasta deste arquivo.
// Assim o servidor funciona mesmo sendo iniciado de outra pasta.
const PASTA_DESTE_ARQUIVO = path.dirname(fileURLToPath(import.meta.url))
const ARQUIVO_DE_DADOS = path.join(PASTA_DESTE_ARQUIVO, 'dados.json')

/* ---------------------------------------------------------------------------
   REGRAS DE NEGOCIO

   O ciclo de vida da demanda vem do Documento de Visao. Uma demanda nao
   pode pular etapas: para ser concluida, ela precisa passar por Em revisao.
   Por isso a tela nao mostra um botao "Concluir" enquanto a demanda estiver
   Em andamento.

   A lista abaixo diz, para cada status, quais sao os proximos permitidos.
   Deixar essa regra escrita em um unico lugar evita que a tela e o servidor
   discordem sobre o que pode ser feito.
--------------------------------------------------------------------------- */
const PROXIMOS_STATUS = {
  ABERTA: ['EM_ANDAMENTO', 'CANCELADA'],
  EM_ANDAMENTO: ['EM_REVISAO', 'CANCELADA'],
  EM_REVISAO: ['CONCLUIDA', 'EM_ANDAMENTO', 'CANCELADA'],

  // Demandas encerradas nao mudam mais de status. O Documento de Visao
  // tambem proibe apagar demandas: cancelar e o encerramento definitivo.
  CONCLUIDA: [],
  CANCELADA: [],
}

/** Como cada status aparece escrito na tela. */
const NOME_DO_STATUS = {
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  EM_REVISAO: 'Em revisao',
  CONCLUIDA: 'Concluida',
  CANCELADA: 'Cancelada',
}

const NOME_DA_PRIORIDADE = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Critica',
}

const NOME_DO_TIPO = {
  TAREFA: 'Tarefa',
  DEFEITO: 'Defeito',
  MELHORIA: 'Melhoria',
  DOCUMENTACAO: 'Documentacao',
}

/**
 * Texto do botao que leva a cada status.
 *
 * Cancelar ganha um texto proprio porque "Mover para Cancelada" soa
 * estranho para quem esta usando o sistema.
 */
const TEXTO_DO_BOTAO = {
  EM_ANDAMENTO: 'Mover para Em andamento',
  EM_REVISAO: 'Mover para Em revisao',
  CONCLUIDA: 'Concluir demanda',
  CANCELADA: 'Cancelar demanda',
}

/* ---------------------------------------------------------------------------
   LEITURA E GRAVACAO DO ARQUIVO
--------------------------------------------------------------------------- */

/** Le o arquivo de dados e devolve o conteudo ja convertido em objeto. */
async function lerDados() {
  const texto = await readFile(ARQUIVO_DE_DADOS, 'utf8')
  return JSON.parse(texto)
}

/**
 * Grava o objeto de volta no arquivo.
 *
 * O numero 2 no JSON.stringify e a quantidade de espacos de recuo. Ele
 * deixa o arquivo legivel para uma pessoa, em vez de gravar tudo em uma
 * unica linha comprida.
 */
async function gravarDados(dados) {
  await writeFile(ARQUIVO_DE_DADOS, `${JSON.stringify(dados, null, 2)}\n`, 'utf8')
}

/** Data e hora de agora no formato usado pelo arquivo: 2026-09-20 14:32 */
function agora() {
  const d = new Date()
  const doisDigitos = (numero) => String(numero).padStart(2, '0')

  const data = `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
  const hora = `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`

  return `${data} ${hora}`
}

/**
 * Devolve o proximo numero livre de uma lista.
 *
 * Faz o papel que o banco de dados fara sozinho mais adiante, com a
 * numeracao automatica das chaves primarias.
 */
function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1
}

/**
 * Monta a demanda no formato que a tela espera.
 *
 * O arquivo guarda o status como EM_ANDAMENTO, em letras maiusculas, que e
 * um formato bom para o programa comparar. A tela precisa de "Em andamento",
 * que e o formato bom para uma pessoa ler. A traducao acontece aqui, em um
 * lugar so, em vez de ser repetida em cada parte da tela.
 *
 * Junto vai a lista de acoes permitidas a partir do status atual. Quem
 * decide quais botoes existem e o servidor, e nao a tela: assim a regra
 * vale mesmo que alguem chame a rota por fora do navegador.
 */
function prepararDemandaParaATela(demanda) {
  const acoes = PROXIMOS_STATUS[demanda.status].map((status) => ({
    status,
    texto: TEXTO_DO_BOTAO[status],

    // Cancelar recebe aparencia de acao destrutiva na tela.
    estilo: status === 'CANCELADA' ? 'perigo' : 'principal',
  }))

  return {
    ...demanda,
    statusDescricao: NOME_DO_STATUS[demanda.status],
    prioridadeDescricao: NOME_DA_PRIORIDADE[demanda.prioridade],
    tipoDescricao: NOME_DO_TIPO[demanda.tipo],
    acoes,

    // O historico e guardado do mais antigo para o mais novo, porque e
    // assim que ele cresce. A tela mostra o mais recente primeiro, entao
    // a lista e invertida aqui.
    historico: [...demanda.historico].reverse(),
  }
}

/* ---------------------------------------------------------------------------
   ROTAS
--------------------------------------------------------------------------- */

/**
 * GET /api/demandas/:id
 *
 * Entrega tudo o que a tela precisa em uma unica chamada: os dados da
 * demanda, os comentarios, o historico e as acoes permitidas.
 *
 * Uma chamada so, em vez de tres, porque a tela nunca precisa de uma
 * dessas partes sem as outras.
 */
rotasDetalhes.get('/api/demandas/:id', async (req, res) => {
  const dados = await lerDados()
  const demanda = dados.demandas.find((d) => d.id === Number(req.params.id))

  if (!demanda) {
    return res.status(404).json({ erro: 'Demanda nao encontrada.' })
  }

  res.json({
    demanda: prepararDemandaParaATela(demanda),
    usuarioLogado: dados.usuarioLogado,
  })
})

/**
 * POST /api/demandas/:id/comentarios
 *
 * Registra um comentario novo. O corpo da requisicao traz { texto }.
 *
 * O autor nao vem da tela, e sim do usuario logado guardado no servidor.
 * Se viesse da tela, qualquer pessoa poderia comentar no nome de outra
 * apenas alterando o que o navegador envia.
 */
rotasDetalhes.post('/api/demandas/:id/comentarios', async (req, res) => {
  const dados = await lerDados()
  const demanda = dados.demandas.find((d) => d.id === Number(req.params.id))

  if (!demanda) {
    return res.status(404).json({ erro: 'Demanda nao encontrada.' })
  }

  const texto = String(req.body?.texto ?? '').trim()

  if (texto === '') {
    return res.status(400).json({ erro: 'Escreva o comentario antes de enviar.' })
  }

  if (texto.length > 2000) {
    return res.status(400).json({ erro: 'O comentario pode ter no maximo 2000 caracteres.' })
  }

  demanda.comentarios.push({
    id: proximoId(demanda.comentarios),
    autor: dados.usuarioLogado.nome,
    texto,
    criadoEm: agora(),
  })

  await gravarDados(dados)

  // Devolve a demanda inteira para a tela se redesenhar ja atualizada,
  // sem precisar de uma segunda chamada ao servidor.
  res.status(201).json({ demanda: prepararDemandaParaATela(demanda) })
})

/**
 * PATCH /api/demandas/:id/status
 *
 * Muda o status da demanda. O corpo traz { status }.
 *
 * PATCH, e nao PUT, porque a requisicao altera um campo da demanda em vez
 * de substituir a demanda inteira.
 *
 * A mudanca so acontece se ela respeitar o ciclo de vida. A tela ja mostra
 * apenas os botoes permitidos, mas a conferencia e repetida aqui de
 * proposito: a tela e apenas a aparencia, e quem garante a regra e o
 * servidor.
 */
rotasDetalhes.patch('/api/demandas/:id/status', async (req, res) => {
  const dados = await lerDados()
  const demanda = dados.demandas.find((d) => d.id === Number(req.params.id))

  if (!demanda) {
    return res.status(404).json({ erro: 'Demanda nao encontrada.' })
  }

  const novoStatus = String(req.body?.status ?? '')

  if (!NOME_DO_STATUS[novoStatus]) {
    return res.status(400).json({ erro: 'Status desconhecido.' })
  }

  if (!PROXIMOS_STATUS[demanda.status].includes(novoStatus)) {
    return res.status(400).json({
      erro:
        `Uma demanda ${NOME_DO_STATUS[demanda.status].toLowerCase()} nao pode ` +
        `passar para ${NOME_DO_STATUS[novoStatus].toLowerCase()}.`,
    })
  }

  const statusAnterior = demanda.status
  demanda.status = novoStatus
  demanda.atualizadoEm = agora()

  // Toda mudanca de status vira uma linha do historico. O Documento de
  // Visao pede que o historico nunca seja apagado, entao aqui so se
  // acrescenta ao fim da lista.
  demanda.historico.push({
    id: proximoId(demanda.historico),
    descricao:
      `Status alterado de <valor>${NOME_DO_STATUS[statusAnterior]}</valor> ` +
      `para <valor>${NOME_DO_STATUS[novoStatus]}</valor>`,
    autor: dados.usuarioLogado.nome,
    criadoEm: agora(),
  })

  await gravarDados(dados)

  res.json({ demanda: prepararDemandaParaATela(demanda) })
})
