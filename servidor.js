/**
 * Autor exclusivo deste arquivo: Gabriel Lopes Londe Rodrigues
 *
 * Projeto Integrador II - Engenharia de Software
 * Equipe: PI-II-TIME-11
 * Aluno 5 - Servidor da tela de Detalhes da Demanda
 *
 * Ponto de partida do backend. Sobe um servidor que faz duas coisas:
 * entrega os arquivos da tela (HTML, CSS e JavaScript) e responde as
 * rotas da API.
 *
 * Servir as duas coisas pelo mesmo endereco evita o problema de CORS,
 * que e a regra do navegador que impede uma pagina de chamar um servidor
 * de outro endereco. Como a tela e a API ficam ambas em
 * http://localhost:3000, o navegador nao reclama.
 *
 * Como rodar, a partir desta pasta:
 *
 *     npm install
 *     npm run dev
 *
 * Depois abra http://localhost:3000 no navegador.
 *
 * Este arquivo existe para o repositorio rodar sozinho. Quando as partes
 * do sistema forem juntadas, quem sobe o servidor e o app.js da equipe, e
 * dali basta usar o rotas-detalhes.js.
 */

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { rotasDetalhes } from './rotas-detalhes.js'

const app = express()
const PORTA = 3000

// Pasta deste arquivo, usada para achar o HTML e o CSS.
const PASTA_DESTE_ARQUIVO = path.dirname(fileURLToPath(import.meta.url))

/*
 * Ensina o Express a ler o corpo das requisicoes escrito em JSON.
 *
 * Sem esta linha, req.body chega vazio nas rotas que recebem dados, como
 * a de comentario, e o comentario seria gravado em branco.
 */
app.use(express.json())

// Entrega os arquivos da tela: HTML, CSS e JavaScript.
app.use(express.static(PASTA_DESTE_ARQUIVO))

// Rotas da API da tela de Detalhes.
app.use(rotasDetalhes)

/*
 * Abrir a raiz do endereco leva direto para a tela de Detalhes.
 *
 * Sem isto, http://localhost:3000 mostraria a lista de arquivos da pasta,
 * e seria preciso digitar o nome do arquivo na mao.
 */
app.get('/', (_req, res) => {
  res.sendFile(path.join(PASTA_DESTE_ARQUIVO, 'detalhes-demanda.html'))
})

/*
 * Tratamento de erro.
 *
 * Precisa ficar depois das rotas, porque o Express percorre esta lista na
 * ordem em que ela foi escrita. Os quatro parametros, comecando por erro,
 * sao o que identifica esta funcao como tratadora de erros.
 *
 * Sem ela, uma falha no servidor derrubaria o programa inteiro e a tela
 * ficaria esperando para sempre.
 */
app.use((erro, _req, res, _proximo) => {
  console.error('[servidor] Erro ao responder a requisicao:', erro)
  res.status(500).json({
    erro: 'Nao foi possivel concluir a operacao. Tente novamente.',
  })
})

app.listen(PORTA, () => {
  console.log(`[servidor] Tela disponivel em http://localhost:${PORTA}`)
})
