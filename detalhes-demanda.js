/**
 * Autor exclusivo deste arquivo: Gabriel Lopes Londe Rodrigues
 *
 * Projeto Integrador II - Engenharia de Software
 * Equipe: PI-II-TIME-11
 * Aluno 5 - Comportamento da tela de Detalhes da Demanda
 *
 * Este arquivo liga a tela ao backend. Ele:
 * 1. descobre qual demanda abrir;
 * 2. busca os dados no servidor;
 * 3. desenha a tela com o que chegou;
 * 4. envia os comentarios e as mudancas de status.
 *
 * Antes desta etapa o conteudo estava escrito a mao dentro do HTML, como
 * exemplo. Agora o HTML traz apenas as areas vazias, e quem as preenche e
 * este arquivo, com os dados que vem do servidor.
 */

/* ---------------------------------------------------------------------------
   QUAL DEMANDA ABRIR

   O numero vem do proprio endereco da pagina, assim:
     detalhes-demanda.html?id=1

   Ler o numero do endereco e o que permite a listagem abrir qualquer
   demanda usando a mesma tela. Quando nao houver numero nenhum, abrimos a
   demanda 1, para a tela continuar funcionando ao ser aberta direto.
--------------------------------------------------------------------------- */
const idDaDemanda = new URLSearchParams(window.location.search).get('id') || '1'

/* ---------------------------------------------------------------------------
   PROTECAO CONTRA TEXTO QUE VIRA CODIGO

   O texto de um comentario e escrito por uma pessoa. Se alguem digitasse
   <script>algo</script> e esse texto fosse colocado direto na pagina, o
   navegador executaria o codigo. Esse ataque se chama XSS.

   A funcao abaixo troca os caracteres especiais do HTML pelo codigo
   equivalente, entao o navegador mostra o texto como texto.
--------------------------------------------------------------------------- */
function textoSeguro(valor) {
  if (valor === null || valor === undefined) {
    return ''
  }

  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Converte a data do servidor (2026-09-10) para o formato brasileiro
 * (10/09/2026).
 *
 * A conversao e feita separando o texto, e nao com o objeto Date, de
 * proposito: o Date ajustaria a data para o fuso horario do computador e
 * o dia poderia aparecer com 24 horas de diferenca.
 */
function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] = data.substring(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

/** Converte 2026-09-10 14:32 para 10/09/2026 as 14:32. */
function formatarDataHora(dataHora) {
  if (!dataHora) {
    return '-'
  }

  const hora = String(dataHora).substring(11, 16)
  return hora ? `${formatarData(dataHora)} as ${hora}` : formatarData(dataHora)
}

/**
 * Diz quantos dias faltam para o prazo, ou se ele ja passou.
 *
 * Devolve uma string vazia quando o prazo esta longe, para nao poluir a
 * tela com um aviso que nao interessa.
 */
function avisoDePrazo(prazo) {
  if (!prazo) {
    return ''
  }

  const [ano, mes, dia] = prazo.substring(0, 10).split('-').map(Number)
  const dataDoPrazo = new Date(ano, mes - 1, dia)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // 86400000 e a quantidade de milissegundos em um dia.
  const diasRestantes = Math.round((dataDoPrazo - hoje) / 86400000)

  if (diasRestantes < 0) {
    return 'atrasada'
  }

  if (diasRestantes === 0) {
    return 'vence hoje'
  }

  if (diasRestantes <= 7) {
    return `faltam ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`
  }

  return ''
}

/** Mostra um aviso no topo da tela. */
function mostrarAviso(texto, tipo = 'erro') {
  const area = document.getElementById('areaDeAviso')
  area.textContent = texto
  area.className = `aviso aviso--${tipo}`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Esconde o aviso do topo. */
function esconderAviso() {
  document.getElementById('areaDeAviso').className = 'aviso aviso--escondido'
}

/* ---------------------------------------------------------------------------
   CONVERSA COM O SERVIDOR

   Todas as chamadas passam por esta funcao. Concentrar isso em um lugar so
   resolve dois problemas de uma vez: o erro chega sempre no mesmo formato
   para a tela, e a mensagem escrita pelo servidor e aproveitada como esta,
   em vez de cada parte da tela inventar a sua.
--------------------------------------------------------------------------- */
async function chamarApi(caminho, opcoes = {}) {
  const { metodo = 'GET', corpo = null } = opcoes

  let resposta

  try {
    resposta = await fetch(caminho, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : {},
      body: corpo ? JSON.stringify(corpo) : null,
    })
  } catch {
    // Este catch pega apenas falha de conexao: servidor desligado. Erros
    // de regra chegam como resposta normal e sao tratados logo abaixo.
    throw new Error(
      'Nao foi possivel falar com o servidor. Confira se ele esta ligado ' +
        'com o comando npm run dev.'
    )
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    throw new Error(dados?.erro || 'Nao foi possivel concluir a operacao.')
  }

  return dados
}

/* ---------------------------------------------------------------------------
   DESENHO DA TELA
--------------------------------------------------------------------------- */

/** Preenche o cabecalho com o usuario logado. */
function desenharUsuario(usuario) {
  document.getElementById('nomeDoUsuario').textContent = usuario.nome
  document.getElementById('perfilDoUsuario').textContent = usuario.perfil
  document.getElementById('inicialDoUsuario').textContent = usuario.nome
    .trim()
    .charAt(0)
    .toUpperCase()
}

/**
 * Preenche o topo: titulo e as tres etiquetas.
 *
 * A classe da etiqueta sai do proprio valor, em letras minusculas e com o
 * tracinho no lugar do sublinhado: EM_ANDAMENTO vira etiqueta--em-andamento.
 */
function desenharTopo(demanda) {
  document.title = `${demanda.titulo} | Acompanhamento de Demandas`
  document.getElementById('tituloDaDemanda').textContent = demanda.titulo

  const classeDoStatus = demanda.status.toLowerCase().replaceAll('_', '-')
  const classeDaPrioridade = demanda.prioridade.toLowerCase()

  document.getElementById('etiquetasDaDemanda').innerHTML = `
    <span class="etiqueta etiqueta--${classeDoStatus}">
      ${textoSeguro(demanda.statusDescricao)}
    </span>
    <span class="etiqueta etiqueta--${classeDaPrioridade}">
      ${textoSeguro(demanda.prioridadeDescricao)}
    </span>
    <span class="etiqueta etiqueta--tipo">
      ${textoSeguro(demanda.tipoDescricao)}
    </span>
  `
}

/** Escreve a descricao, um paragrafo por item da lista. */
function desenharDescricao(demanda) {
  document.getElementById('descricaoDaDemanda').innerHTML = demanda.descricao
    .map((paragrafo) => `<p class="descricao">${textoSeguro(paragrafo)}</p>`)
    .join('')
}

/**
 * Monta os botoes de mudanca de status.
 *
 * Quem decide quais botoes existem e o servidor, que envia a lista de
 * acoes permitidas junto com a demanda. A tela apenas desenha o que
 * recebeu. E por isso que nao aparece um botao de concluir enquanto a
 * demanda esta Em andamento: ela precisa passar por Em revisao antes.
 */
function desenharAcoes(demanda) {
  const secao = document.getElementById('secaoDeAcoes')
  const area = document.getElementById('botoesDeStatus')

  // Demanda concluida ou cancelada nao muda mais de status: a secao
  // inteira sai da tela, em vez de ficar vazia.
  if (demanda.acoes.length === 0) {
    secao.hidden = true
    return
  }

  secao.hidden = false

  document.getElementById('statusAtual').textContent =
    `Status atual: ${demanda.statusDescricao}. Escolha o proximo passo.`

  area.innerHTML = demanda.acoes
    .map(
      (acao) => `
        <button type="button"
                class="botao botao--${acao.estilo}"
                data-status="${textoSeguro(acao.status)}">
          ${textoSeguro(acao.texto)}
        </button>
      `
    )
    .join('')
}

/** Desenha a lista de comentarios e atualiza o contador do titulo. */
function desenharComentarios(demanda) {
  document.getElementById('contadorDeComentarios').textContent =
    `(${demanda.comentarios.length})`

  const area = document.getElementById('listaDeComentarios')

  if (demanda.comentarios.length === 0) {
    area.innerHTML = `
      <p class="texto-apoio">
        Nenhum comentario ainda. Seja o primeiro a registrar uma observacao.
      </p>
    `
    return
  }

  area.innerHTML = demanda.comentarios
    .map(
      (comentario) => `
        <article class="comentario">
          <div class="comentario__inicial" aria-hidden="true">
            ${textoSeguro(comentario.autor.trim().charAt(0).toUpperCase())}
          </div>
          <div class="comentario__conteudo">
            <div class="comentario__topo">
              <span class="comentario__autor">${textoSeguro(comentario.autor)}</span>
              <span class="comentario__data">${formatarDataHora(comentario.criadoEm)}</span>
            </div>
            <p class="comentario__texto">${textoSeguro(comentario.texto)}</p>
          </div>
        </article>
      `
    )
    .join('')
}

/** Preenche a ficha lateral com os dados da demanda. */
function desenharFicha(demanda) {
  const aviso = avisoDePrazo(demanda.prazoFinalizacao)

  // O prazo so fica vermelho quando a demanda ainda esta pendente. Uma
  // demanda concluida com prazo vencido nao e mais um problema.
  const pendente = demanda.status !== 'CONCLUIDA' && demanda.status !== 'CANCELADA'
  const classeDoPrazo = pendente && aviso ? 'ficha__valor ficha__valor--atencao' : 'ficha__valor'

  const textoDoPrazo = demanda.prazoFinalizacao
    ? `${formatarData(demanda.prazoFinalizacao)}${aviso ? ` (${aviso})` : ''}`
    : 'Nao informado'

  const linhas = [
    ['Numero', `#${demanda.id}`],
    ['Projeto', textoSeguro(demanda.projeto)],
    ['Responsavel', textoSeguro(demanda.responsavel || 'Sem responsavel')],
    ['Cadastrada por', textoSeguro(demanda.cadastradaPor)],
    ['Data de criacao', formatarDataHora(demanda.criadoEm)],
    ['Ultima atualizacao', formatarDataHora(demanda.atualizadoEm)],
  ]

  document.getElementById('fichaDaDemanda').innerHTML = `
    ${linhas
      .map(
        ([rotulo, valor]) => `
          <div class="ficha__item">
            <dt class="ficha__rotulo">${rotulo}</dt>
            <dd class="ficha__valor">${valor}</dd>
          </div>
        `
      )
      .join('')}
    <div class="ficha__item">
      <dt class="ficha__rotulo">Prazo de finalizacao</dt>
      <dd class="${classeDoPrazo}">${textoSeguro(textoDoPrazo)}</dd>
    </div>
  `
}

/**
 * Desenha o historico como linha do tempo.
 *
 * O servidor marca os valores alterados com <valor>...</valor>. A troca
 * acontece depois do textoSeguro, e nao antes: assim o que o usuario
 * escreveu continua protegido, e apenas a marcacao criada pelo proprio
 * servidor vira HTML de verdade.
 */
function desenharHistorico(demanda) {
  document.getElementById('listaDoHistorico').innerHTML = demanda.historico
    .map((item) => {
      const descricao = textoSeguro(item.descricao)
        .replaceAll('&lt;valor&gt;', '<span class="historico__valor">')
        .replaceAll('&lt;/valor&gt;', '</span>')

      return `
        <li class="historico__item">
          <div>${descricao}</div>
          <div class="historico__rodape">
            ${textoSeguro(item.autor)} &middot; ${formatarDataHora(item.criadoEm)}
          </div>
        </li>
      `
    })
    .join('')
}

/** Desenha a tela inteira a partir de uma demanda. */
function desenharDemanda(demanda) {
  desenharTopo(demanda)
  desenharDescricao(demanda)
  desenharAcoes(demanda)
  desenharComentarios(demanda)
  desenharFicha(demanda)
  desenharHistorico(demanda)

  document.getElementById('linkDeEditar').href = `#editar-${demanda.id}`
}

/* ---------------------------------------------------------------------------
   ACOES DO USUARIO
--------------------------------------------------------------------------- */

/** Envia o comentario escrito no campo. */
async function enviarComentario() {
  const campo = document.getElementById('comentario')
  const botao = document.getElementById('botaoComentar')
  const erro = document.getElementById('erroComentario')

  erro.textContent = ''
  esconderAviso()

  if (campo.value.trim() === '') {
    erro.textContent = 'Escreva o comentario antes de enviar.'
    campo.focus()
    return
  }

  // Desligar o botao evita que um clique duplo grave o mesmo comentario
  // duas vezes, e o texto trocado avisa que algo esta acontecendo.
  botao.disabled = true
  botao.textContent = 'Enviando...'

  try {
    const resposta = await chamarApi(`/api/demandas/${idDaDemanda}/comentarios`, {
      metodo: 'POST',
      corpo: { texto: campo.value.trim() },
    })

    campo.value = ''
    desenharDemanda(resposta.demanda)
    mostrarAviso('Comentario registrado.', 'sucesso')
  } catch (falha) {
    mostrarAviso(falha.message)
  } finally {
    // O finally roda tendo dado certo ou errado, entao o botao nunca fica
    // travado depois de uma falha.
    botao.disabled = false
    botao.textContent = 'Enviar comentario'
  }
}

/** Muda o status da demanda. */
async function mudarStatus(novoStatus, botao) {
  esconderAviso()

  // Cancelar encerra a demanda em definitivo, entao vale confirmar antes.
  if (novoStatus === 'CANCELADA') {
    const confirmou = window.confirm(
      'Cancelar esta demanda? Ela nao podera mais ter o status alterado.'
    )

    if (!confirmou) {
      return
    }
  }

  const textoOriginal = botao.textContent
  botao.disabled = true
  botao.textContent = 'Salvando...'

  try {
    const resposta = await chamarApi(`/api/demandas/${idDaDemanda}/status`, {
      metodo: 'PATCH',
      corpo: { status: novoStatus },
    })

    desenharDemanda(resposta.demanda)
    mostrarAviso(
      `Status alterado para ${resposta.demanda.statusDescricao}.`,
      'sucesso'
    )
  } catch (falha) {
    mostrarAviso(falha.message)
    botao.disabled = false
    botao.textContent = textoOriginal
  }
}

/* ---------------------------------------------------------------------------
   BOTAO VOLTAR

   Volta para a tela anterior de verdade, usando o historico do navegador.
   Se a pessoa veio da listagem, volta para a listagem; se veio do
   dashboard, volta para o dashboard.

   O problema de usar apenas history.back e quando nao existe tela
   anterior: alguem que abriu esta pagina direto, por um link colado ou
   pelos favoritos, clicaria no botao e nada aconteceria. Por isso a
   condicao abaixo: so volta se houver para onde voltar; caso contrario,
   segue para a listagem, que e o caminho natural desta tela.

   O history.length comeca em 1 quando a aba acabou de ser aberta nesta
   pagina, e cresce a cada navegacao dentro da mesma aba.
--------------------------------------------------------------------------- */
function voltarParaATelaAnterior(evento) {
  evento.preventDefault()

  if (window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.href = evento.currentTarget.getAttribute('href')
}

/* ---------------------------------------------------------------------------
   PONTO DE PARTIDA
--------------------------------------------------------------------------- */
async function iniciarTela() {
  document
    .getElementById('linkDeVoltar')
    .addEventListener('click', voltarParaATelaAnterior)

  document
    .getElementById('formularioDeComentario')
    .addEventListener('submit', (evento) => {
      evento.preventDefault()
      enviarComentario()
    })

  /*
   * Um unico ouvinte na area dos botoes, em vez de um por botao.
   *
   * Os botoes sao redesenhados a cada mudanca de status, entao um ouvinte
   * preso a cada botao precisaria ser registrado de novo toda vez. Um
   * ouvinte no elemento que os contem continua valendo, porque o clique
   * sobe ate ele. Isso se chama delegacao de eventos.
   */
  document.getElementById('botoesDeStatus').addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-status]')

    if (botao) {
      mudarStatus(botao.dataset.status, botao)
    }
  })

  try {
    const resposta = await chamarApi(`/api/demandas/${idDaDemanda}`)

    desenharUsuario(resposta.usuarioLogado)
    desenharDemanda(resposta.demanda)

    document.getElementById('avisoCarregando').hidden = true
    document.getElementById('conteudoDaDemanda').hidden = false
  } catch (falha) {
    document.getElementById('avisoCarregando').hidden = true
    mostrarAviso(falha.message)
  }
}

iniciarTela()
