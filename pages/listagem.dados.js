// Autor do arquivo: Gabriel Lopes Londe Rodrigues
// Monta a tabela da listagem com as demandas que vem do servidor

const corpo_tabela = document.querySelector("tbody")
const total_demandas = document.querySelector(".total")

// Converte a data de 2026-10-15 para 15/10/2026.
// A separacao e feita no texto, e nao com o objeto Date, porque o Date
// ajustaria para o fuso horario do computador e o dia poderia aparecer
// com um dia de diferenca.
function formatarData(data) {
    if (!data) {
        return "-"
    }

    const partes = String(data).split("-")

    if (partes.length !== 3) {
        return data
    }

    return partes[2] + "/" + partes[1] + "/" + partes[0]
}

// Busca as demandas e desenha a tabela
async function carregarDemandas() {
    const resposta = await fetch("/api/demandas")
    const dados = await resposta.json()

    corpo_tabela.innerHTML = ""

    if (dados.total === 0) {
        corpo_tabela.innerHTML = "<tr><td colspan='9'>Nenhuma demanda cadastrada ainda.</td></tr>"
        total_demandas.textContent = "Total de demandas: 0"
        return
    }

    dados.demandas.forEach((d) => {
        const linha = document.createElement("tr")

        // O textContent escreve o texto como texto. Se o titulo de uma
        // demanda tiver um sinal de menor que, ele aparece escrito em vez
        // de virar codigo na pagina.
        const colunas = [
            d.titulo,
            d.tipo || "-",
            d.prioridade || "-",
            d.status,
            d.projeto || "-",
            d.responsavel || "Sem responsavel",
            d.criacao,
            formatarData(d.prazo)
        ]

        colunas.forEach((valor) => {
            const td = document.createElement("td")
            td.textContent = valor
            linha.appendChild(td)
        })

        // A ultima coluna leva para a tela de Detalhes, informando qual
        // demanda foi escolhida pelo numero no endereco
        const td_link = document.createElement("td")
        const link = document.createElement("a")
        link.href = "detalhes.demanda.html?id=" + d.id
        link.textContent = "Detalhes"
        td_link.appendChild(link)
        linha.appendChild(td_link)

        corpo_tabela.appendChild(linha)
    })

    total_demandas.textContent = "Total de demandas: " + dados.total
}

carregarDemandas()
