# Tela de Detalhes da Demanda - Aluno 5

Autor: Gabriel Lopes Londe Rodrigues

Projeto Integrador II - Engenharia de Software  
Equipe: PI-II-TIME-11

---

## O que tem aqui

Este repositorio guarda a minha parte do sistema: a tela de Detalhes da
Demanda, agora com o backend que a faz funcionar de verdade.

| Arquivo | O que e |
|---|---|
| `detalhes-demanda.html` | A tela |
| `detalhes-demanda.css` | Os estilos da tela |
| `detalhes-demanda.js` | O que a tela faz: busca os dados e envia as acoes |
| `servidor.js` | Sobe o servidor e entrega a tela |
| `rotas-detalhes.js` | As rotas da API e as regras de negocio |
| `dados.json` | Onde os dados ficam guardados |

## Como executar

Precisa do Node.js instalado. A partir desta pasta:

```
npm install
npm run dev
```

O terminal mostra:

```
[servidor] Tela disponivel em http://localhost:3000
```

Abra `http://localhost:3000` no navegador.

### Atencao: mudou a forma de abrir

Na Reuniao 2 a tela abria com um duplo clique no arquivo HTML. **Isso nao
funciona mais.** Agora o conteudo vem do servidor, entao a tela precisa
ser aberta pelo endereco `http://localhost:3000`. Abrindo o arquivo direto
do disco, o navegador nao encontra o servidor e a tela fica vazia.

## O que a tela faz

- Carrega a demanda, os comentarios e o historico do servidor
- Registra um comentario novo, que fica gravado
- Muda o status da demanda respeitando o ciclo de vida
- Anota sozinha, no historico, toda mudanca de status
- Avisa na propria tela quando algo da certo ou da errado
- Botao de voltar para a tela anterior

## As rotas do backend

| Metodo | Endereco | O que faz |
|---|---|---|
| `GET` | `/api/demandas/:id` | Devolve a demanda, os comentarios, o historico e as acoes permitidas |
| `POST` | `/api/demandas/:id/comentarios` | Registra um comentario |
| `PATCH` | `/api/demandas/:id/status` | Muda o status da demanda |

As tres devolvem a demanda inteira ja atualizada, para a tela se redesenhar
sem precisar de uma segunda chamada.

`PATCH` e usado no lugar de `PUT` porque a requisicao altera um campo da
demanda, e nao substitui a demanda inteira.

## A regra do ciclo de vida

Pelo Documento de Visao, uma demanda nao pode pular etapas:

```
Aberta  ->  Em andamento  ->  Em revisao  ->  Concluida
```

Cancelar encerra a demanda a partir de qualquer um desses estados. Demandas
nunca sao apagadas: cancelar e o encerramento definitivo.

Por isso, quando a demanda esta **Em andamento**, a tela nao mostra botao de
concluir: so aparece "Mover para Em revisao". O botao de concluir surge
depois que ela chega em Em revisao.

Quem decide quais botoes existem e o servidor, que envia a lista de acoes
permitidas junto com a demanda. A tela apenas desenha o que recebeu.

A conferencia e feita **duas vezes**, na tela e no servidor, de proposito. A
tela e apenas a aparencia: alguem que chame a rota por fora do navegador
continua barrado pelo servidor.

## Onde os dados ficam

Em um arquivo chamado `dados.json`, na mesma pasta.

O projeto ainda nao tem banco de dados. Gravar em arquivo tem duas vantagens
sobre guardar os dados so na memoria do programa: o que for escrito continua
la depois de desligar o servidor, e da para abrir o arquivo e ler o conteudo
a olho nu, o que ajuda a conferir se uma operacao funcionou.

Quando o banco de dados entrar no projeto, so as funcoes `lerDados` e
`gravarDados` do arquivo `rotas-detalhes.js` precisam mudar. O resto
continua igual.

Para voltar aos dados de exemplo, e so desfazer as alteracoes do
`dados.json` com o git.

## Como juntar com o repositorio da equipe

O repositorio da equipe ja tem um `app.js`, que e de outro integrante. Para
nao precisar mexer no arquivo dele, as minhas rotas ficam separadas em um
Router, dentro de `rotas-detalhes.js`.

A integracao vira duas linhas dentro do `app.js` da equipe, sem apagar nada
do que ja existe:

```js
import { rotasDetalhes } from './rotas-detalhes.js'
app.use(rotasDetalhes)
```

Para isso funcionar, o `app.js` da equipe tambem precisa ter a linha
`app.use(express.json())`, que ensina o Express a ler o corpo das
requisicoes. Sem ela, o comentario chega vazio no servidor.

Os arquivos a copiar sao `rotas-detalhes.js`, `dados.json`,
`detalhes-demanda.html`, `detalhes-demanda.css` e `detalhes-demanda.js`.
O `servidor.js` nao vai junto: ele existe para este repositorio rodar
sozinho, e no repositorio da equipe esse papel e do `app.js`.

O commit precisa sair da minha maquina e com o meu nome, porque a avaliacao
considera a autoria individual pelo historico do GitHub.

## Responsividade

A tela funciona em computador, tablet e celular.

- Ate 1000px de largura, a coluna lateral desce para baixo do conteudo
- Ate 640px, o menu vai para uma linha propria e os botoes ocupam a largura
  toda, ficando mais faceis de tocar com o dedo

Para testar: abra a tela no navegador, aperte F12 e ative o modo de
dispositivo movel.

## Padrao visual

Cores combinadas pelo grupo:

| Codigo | Uso |
|---|---|
| `#000000` | Textos de maior contraste |
| `#14213D` | Cabecalho, titulos e textos |
| `#FCA311` | Cor de acao e destaque |
| `#E5E5E5` | Fundo da pagina |
| `#FFFFFF` | Fundo dos cards e dos campos |

Foram acrescentadas duas cores de apoio, verde para sucesso e vermelho para
erro e alerta de prazo, porque a paleta original nao permitia diferenciar
uma confirmacao de um problema.

### Por que a tela deixou de ser escura

Esta tela nasceu com fundo preto. As outras quatro telas do sistema (login,
dashboard, listagem e cadastro) foram feitas com fundo claro, todas usando
`background-color: #E5E5E5`. Uma tela escura no meio de quatro claras
quebrava a unidade visual do sistema.

As cinco cores do grupo continuam exatamente as mesmas. O que mudou foi onde
cada uma e aplicada: o cinza `#E5E5E5`, que antes pintava textos
secundarios, passou a ser o fundo da pagina; o azul `#14213D`, que antes era
fundo de card, passou a ser a cor do texto e do cabecalho; e o branco, que
era a cor do texto, passou a ser o fundo dos cards.

As cores estao guardadas em variaveis no inicio do arquivo CSS. Para mudar a
aparencia da tela inteira, basta alterar esse bloco.
