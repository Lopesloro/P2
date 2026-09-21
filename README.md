# Sistema de Acompanhamento de Demandas - PI-II-TIME-11

Repositorio de trabalho de **Gabriel Lopes Londe Rodrigues**, Aluno 5.

Projeto Integrador II - Engenharia de Software

---

## AVISO SOBRE A AUTORIA DOS ARQUIVOS

Este repositorio **nao e o repositorio oficial da equipe**. O oficial e
`gustavoosantana/PI-II-TIME-11`, e e la que as entregas acontecem.

Aqui o projeto inteiro foi reunido com um unico objetivo: poder ver o
sistema funcionando por completo antes de integrar, com a minha tela
ligada as dos colegas.

Por isso este repositorio contem arquivos que **nao sao de minha autoria**.
Cada um deles traz no topo o nome do autor, como estava no repositorio da
equipe, e nenhum foi alterado por mim.

### O que e meu

| Arquivo | |
|---|---|
| `pages/detalhes.demanda.html` | A tela de Detalhes da Demanda |
| `pages/detalhes.demanda.style.css` | Os estilos dela |
| `pages/detalhes.demanda.js` | O que a tela faz |
| `detalhes.demanda.rotas.js` | As rotas e as regras do backend |

### O que e dos colegas, copiado sem alteracao

| Arquivo | Tela |
|---|---|
| `pages/login.*` | Login |
| `pages/dashboard.*` e `dashboard.js` | Dashboard |
| `pages/listagem*` | Listagem de Demandas |
| `pages/cadastro_demanda*` | Cadastro de Demanda |
| `pages/edicao_demanda.html` | Edicao de Demanda |

### O unico arquivo compartilhado que foi alterado

O `app.js`. A base e da equipe; eu acrescentei quatro trechos, todos
marcados com comentario no proprio arquivo:

- `import` das minhas rotas
- `app.use(express.json())`, para o servidor conseguir ler o que as telas
  enviam
- `app.use(express.static('pages'))`, para as telas serem entregues pelo
  navegador. Sem esta linha nenhuma tela do projeto abre, nem as dos
  colegas
- a porta passou a vir de `process.env.PORT`, exigencia do servico de
  hospedagem. Rodando na propria maquina continua sendo a 3000

Nada disso foi commitado no repositorio da equipe.

## Como executar

```
npm install
npm run dev
```

Abra `http://localhost:3000/login.html`.

A tela de Detalhes fica em `detalhes.demanda.html?id=1`. O numero indica
qual demanda abrir, de 1 a 6, seguindo a ordem da listagem.

## As rotas do backend

| Metodo | Endereco | O que faz |
|---|---|---|
| `GET` | `/api/demanda/:id` | Devolve uma demanda |
| `POST` | `/api/demanda/:id/comentarios` | Registra um comentario |
| `PATCH` | `/api/demanda/:id/status` | Muda o status |

## A regra do ciclo de vida

Pelo Documento de Visao, a demanda nao pode pular etapas:

```
Aberta  ->  Em andamento  ->  Em revisao  ->  Concluida
```

Cancelar encerra a demanda a partir de qualquer um desses pontos.

Por isso, com a demanda **Em andamento**, a tela nao mostra botao de
concluir: so aparece "Mover para Em revisao".

Quem decide quais botoes aparecem e o servidor. A conferencia e feita duas
vezes, na tela e no servidor: a tela e so a aparencia, e quem chamar a
rota por fora do navegador continua barrado.

## De onde vem os dados

As seis demandas dentro de `detalhes.demanda.rotas.js` sao as mesmas seis
que aparecem na tela de listagem, com os mesmos valores de exemplo.

O campo status e o unico que nao copia a listagem. La ele tambem esta
escrito "Exemplo A", que nao e um status valido, e sem um valor de verdade
nao da para conferir o ciclo de vida. Cada demanda recebeu um status
diferente, o que permite testar todos os casos da regra.

Os comentarios e o historico comecam vazios, porque a listagem nao tem
essas informacoes.

Os dados ficam em uma variavel porque o projeto ainda nao tem banco de
dados. Ao reiniciar o servidor eles voltam ao valor inicial.

## O que ainda nao esta ligado

A listagem ainda nao chega ate a tela de Detalhes: o link "Detalhes" de
todas as linhas aponta para `produtodetalhes.html`, arquivo que nao existe
no repositorio, e nao leva o numero da demanda. Para ligar, cada link
precisa virar `detalhes.demanda.html?id=1`, com o numero da linha.

Esse arquivo e de outro integrante, entao a alteracao nao foi feita aqui.
