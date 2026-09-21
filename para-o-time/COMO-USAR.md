# Arquivos prontos para o repositorio da equipe

Estes arquivos vao para o `gustavoosantana/PI-II-TIME-11`. Eles estao aqui
so para serem copiados de la; nada neste repositorio e commitado no da
equipe.

## Onde cada um vai

| Daqui | Para o repositorio da equipe | O que fazer |
|---|---|---|
| `detalhes.demanda.rotas.js` | raiz, do lado do `app.js` | criar |
| `pages/detalhes.demanda.html` | `pages/` | substituir |
| `pages/detalhes.demanda.style.css` | `pages/` | substituir |
| `pages/detalhes.demanda.js` | `pages/` | criar |
| `app.js.MODELO` | nao copiar | serve de conferencia |

## O app.js

O `app.js` da equipe NAO deve ser substituido: ele tem codigo de outro
integrante. Nele se acrescentam quatro trechos. O arquivo `app.js.MODELO`
mostra como ele deve ficar depois: compare o seu com esse.

## Conferir se deu certo

Depois de copiar, dentro do repositorio da equipe:

    npm install
    npm run dev

Abra http://localhost:3000/listagem.html e clique em "Detalhes" de
qualquer linha. Deve abrir a tela de Detalhes com o aviso de que nao ha
demanda cadastrada e o botao "Voltar para a listagem".

Se algum arquivo ficar com 0 bytes, a copia falhou. Confira com:

    wc -l detalhes.demanda.rotas.js pages/detalhes.demanda.js
