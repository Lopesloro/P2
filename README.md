# Tela de Detalhes da Demanda - Aluno 5

Autor: Gabriel Lopes Londe Rodrigues

Projeto Integrador II - Engenharia de Software  
Equipe: PI-II-TIME-11  
Reuniao 2 - Desenvolvimento inicial das interfaces do sistema

---

## O que tem aqui

Este repositorio guarda apenas a minha parte da Reuniao 2: a tela de
Detalhes da Demanda, em HTML e CSS.

| Arquivo | O que e |
|---|---|
| `detalhes-demanda.html` | A tela |
| `detalhes-demanda.css` | Os estilos da tela |

Sao dois arquivos e nada mais. Nao ha banco de dados, API nem backend,
conforme o item 1 da Reuniao 2.

## Como visualizar

Duplo clique em `detalhes-demanda.html`. A tela abre no navegador.

Nao precisa instalar nada, nem ligar servidor. Os dois arquivos precisam
ficar na mesma pasta, porque o HTML procura o CSS ao lado dele.

## O que a tela mostra

- Cabecalho com o nome do sistema, o menu e o usuario logado
- Titulo da demanda e as etiquetas de status, prioridade e tipo
- Descricao completa
- Botoes de atualizacao do andamento
- Comentarios da equipe, com autor, data e hora
- Ficha lateral com numero, projeto, responsavel, datas e prazo
- Historico de alteracoes em linha do tempo

O conteudo exibido e um exemplo escrito direto no HTML. Nas proximas
etapas do projeto ele passara a vir do banco de dados.

## Detalhe do fluxo de trabalho

Na area "Atualizar andamento" nao existe botao de concluir. Isso e
proposital: pelo fluxo definido no Documento de Visao, uma demanda em
andamento precisa passar pelo status Em revisao antes de ser concluida.

## Responsividade

A tela foi construida para funcionar em computador, tablet e celular.

- Ate 1000px de largura, a coluna lateral desce para baixo do conteudo
- Ate 640px, o menu vai para uma linha propria e os botoes ocupam a
  largura toda, ficando mais faceis de tocar com o dedo

Para testar: abra a tela no navegador, aperte F12 e ative o modo de
dispositivo movel.

## Padrao visual

Cores combinadas pelo grupo:

| Codigo | Uso |
|---|---|
| `#000000` | Fundo da pagina |
| `#14213D` | Cards, cabecalho e campos |
| `#FCA311` | Cor de acao e destaque |
| `#E5E5E5` | Textos secundarios |
| `#FFFFFF` | Textos principais |

Foram acrescentadas duas cores de apoio, verde `#2FBF71` para sucesso e
vermelho `#EF4D4D` para erro e alerta de prazo, porque a paleta original
nao permitia diferenciar uma confirmacao de um problema.

As cores estao guardadas em variaveis no inicio do arquivo CSS. Para
mudar a cor principal da tela inteira, basta alterar uma linha.

## Como levar para o repositorio da equipe

Estes arquivos precisam ser copiados para o repositorio do time,
`PI-II-TIME-11`, e commitados de la.

1. Clonar o repositorio da equipe
2. Criar uma branch propria
3. Copiar os dois arquivos para dentro dele
4. Commitar e enviar

O commit precisa sair da minha maquina e com o meu nome, porque a
Reuniao 2 avalia a autoria individual pelo historico do GitHub.
