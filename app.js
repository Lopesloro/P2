// Servidor do sistema
//
// Base escrita pela equipe. As linhas marcadas abaixo foram acrescentadas
// para ligar a tela de Detalhes da Demanda e para publicar no Render.

import express from 'express'

// Rotas da tela de Detalhes da Demanda - Gabriel Lopes Londe Rodrigues
import { rotas as rotasDetalhes } from './detalhes.demanda.rotas.js'


const app = express()

// Permite ler o JSON que as telas enviam nas requisicoes
app.use(express.json())

// Entrega os arquivos HTML, CSS e JS da pasta pages
app.use(express.static('pages'))

// Liga as rotas da tela de Detalhes da Demanda
app.use(rotasDetalhes)

// A porta vem do servico de hospedagem quando o sistema esta publicado na
// internet. Rodando na propria maquina esse valor nao existe, entao usamos
// a 3000, como antes.
const porta = process.env.PORT || 3000

app.listen(porta, () => {
    console.log("Servidor aberto na porta " + porta)
})


app.get("/", (req, res) => {
    res.send("Inicio")
})
