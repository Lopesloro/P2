# Tela de Detalhes da Demanda - Aluno 5

Autor: Gabriel Lopes Londe Rodrigues

Projeto Integrador II - Engenharia de Software
Equipe: PI-II-TIME-11

---

## Arquivos

| Arquivo | O que e |
|---|---|
| `detalhes-demanda.html` | A tela |
| `detalhes-demanda.css` | Os estilos |
| `detalhes-demanda.js` | O que a tela faz |
| `app.js` | O servidor |

## Como executar

Precisa do Node.js instalado. A partir desta pasta:

```
npm install
npm run dev
```

Abra `http://localhost:3000/detalhes-demanda.html`.

Atencao: a tela nao abre mais com duplo clique no arquivo, porque agora
o conteudo vem do servidor.

## O que a tela faz

- Mostra a demanda, os comentarios e o historico
- Registra um comentario novo
- Muda o status da demanda
- Anota sozinha, no historico, toda mudanca de status
- Botao de voltar para a tela anterior

## As rotas

| Metodo | Endereco | O que faz |
|---|---|---|
| `GET` | `/api/demanda` | Devolve a demanda |
| `POST` | `/api/comentarios` | Registra um comentario |
| `PATCH` | `/api/status` | Muda o status |

## A regra do ciclo de vida

Pelo Documento de Visao, a demanda nao pode pular etapas:

```
Aberta  ->  Em andamento  ->  Em revisao  ->  Concluida
```

Cancelar encerra a demanda a partir de qualquer um desses pontos.

Por isso, com a demanda **Em andamento**, a tela nao mostra botao de
concluir: so aparece "Mover para Em revisao". O botao de concluir surge
depois que ela chega em Em revisao.

Quem decide quais botoes aparecem e o servidor. A conferencia e feita
duas vezes, na tela e no servidor: a tela e so a aparencia, e quem chamar
a rota por fora do navegador continua barrado.

## Onde os dados ficam

Em uma variavel dentro do `app.js`, porque o projeto ainda nao tem banco
de dados. Ao desligar o servidor eles voltam ao valor inicial.

## Responsividade

Abaixo de 900px a coluna lateral desce para baixo do conteudo e os botoes
ocupam a largura toda, ficando mais faceis de tocar com o dedo.

## Padrao visual

Cores combinadas pelo grupo:

| Codigo | Uso |
|---|---|
| `#14213D` | Cabecalho e textos |
| `#FCA311` | Cor de acao |
| `#E5E5E5` | Fundo da pagina |
| `#FFFFFF` | Fundo dos cards |

As outras quatro telas do sistema usam fundo claro `#E5E5E5`. Esta tela
era a unica escura, entao foi clareada para ficar igual as demais. As
cores do grupo continuam as mesmas, mudou so onde cada uma e aplicada.

As cores estao em variaveis no inicio do CSS. Para mudar a cor da tela
inteira, basta alterar la.

## Como juntar com o repositorio da equipe

O `app.js` da equipe e de outro integrante. As minhas rotas precisam ser
copiadas para dentro dele, junto com a linha `app.use(express.json())`,
que e o que permite ler o comentario enviado pela tela.
