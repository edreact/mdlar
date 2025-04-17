// Função para buscar dados da API e preencher a tabela
async function fetchData() {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbyXC6bT9qgdhnP4wvTOkZvH50zFTdpEntmmnm070YTlmOoYKXPD4XGM4z9tVmcIlNjW/exec');
    const data = await response.json();

    console.log(data); // Verificando a resposta da API

    const serviceTableBody = document.getElementById("serviceTableBody");

    // Limpar tabela antes de preencher
    serviceTableBody.innerHTML = "";

    // Acessando o array 'saida' da resposta da API
    const services = data.saida;

    // Verificar se os dados existem e preencher a tabela
    if (services && Array.isArray(services)) {
      services.forEach(service => {
        const row = document.createElement("tr");

        const serviceName = document.createElement("td");
        serviceName.textContent = service.servico || 'Não disponível';
        row.appendChild(serviceName);

        const serviceDesc = document.createElement("td");
        serviceDesc.textContent = service.descricao || 'Não disponível';
        row.appendChild(serviceDesc);

        const servicePrice = document.createElement("td");
        servicePrice.textContent = service.preco || 'Não disponível';
        row.appendChild(servicePrice);

        serviceTableBody.appendChild(row);
      });
    } else {
      // Se não houver dados válidos
      serviceTableBody.innerHTML = "<tr><td colspan='3'>Nenhum dado disponível.</td></tr>";
    }
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    document.getElementById("serviceTableBody").innerHTML = "<tr><td colspan='3'>Erro ao carregar dados.</td></tr>";
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