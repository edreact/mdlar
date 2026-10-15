const API_URL = "https://script.google.com/macros/s/AKfycbytbab3mz-45fluEw6r20OGNQT3iRzIFN6VlAFSxaAkqXnxsOBXfJIU2fTckZKZGIA/exec";

// Função para buscar dados da API e preencher a tabela
async function fetchData() {
  try {
    const url = new URL(API_URL);
    url.searchParams.set("aba", "SERVICOS");
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (!response.ok) throw new Error(`A API respondeu com HTTP ${response.status}.`);
    const data = await response.json();

    const serviceTableBody = document.getElementById("serviceTableBody");
    if (!serviceTableBody) return;

    const services = Array.isArray(data.saida) ? data.saida : [];
    if (services.length > 0) {
      const fragment = document.createDocumentFragment();
      services.forEach(item => {
        const row = document.createElement("tr");

        const serviceName = document.createElement("td");
        serviceName.textContent = item.TITULO || "Não disponível";
        row.appendChild(serviceName);

        const serviceDesc = document.createElement("td");
        serviceDesc.textContent = item.DESCRICAO || "Não disponível";
        row.appendChild(serviceDesc);

        const servicePrice = document.createElement("td");
        servicePrice.textContent = item.PRECO || "Não disponível";
        row.appendChild(servicePrice);

        fragment.appendChild(row);
      });
      serviceTableBody.replaceChildren(fragment);
    } else {
      serviceTableBody.innerHTML = "<tr><td colspan=\"3\">Nenhum dado disponível.</td></tr>";
    }
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    const serviceTableBody = document.getElementById("serviceTableBody");
    if (serviceTableBody) {
      serviceTableBody.innerHTML = "<tr><td colspan=\"3\">Erro ao carregar dados.</td></tr>";
    }
  }
}

// Função para a busca
function searchTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const table = document.getElementById("serviceTable");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    let match = false;

    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      if (cell) {
        const text = cell.textContent || cell.innerText;
        if (text.toLowerCase().indexOf(filter) > -1) {
          match = true;
          break;
        }
      }
    }

    rows[i].style.display = match ? "" : "none";
  }
}

// Chamar a função de buscar dados assim que a página carregar
window.onload = fetchData;