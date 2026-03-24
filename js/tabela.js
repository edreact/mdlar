// Fun��o para buscar dados da API e preencher a tabela
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
        serviceName.textContent = service.servico || 'N�o dispon�vel';
        row.appendChild(serviceName);

        const serviceDesc = document.createElement("td");
        serviceDesc.textContent = service.descricao || 'N�o dispon�vel';
        row.appendChild(serviceDesc);

        const servicePrice = document.createElement("td");
        servicePrice.textContent = service.preco || 'N�o dispon�vel';
        row.appendChild(servicePrice);

        serviceTableBody.appendChild(row);
      });
    } else {
      // Se n�o houver dados v�lidos
      serviceTableBody.innerHTML = "<tr><td colspan='3'>Nenhum dado dispon�vel.</td></tr>";
    }
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    document.getElementById("serviceTableBody").innerHTML = "<tr><td colspan='3'>Erro ao carregar dados.</td></tr>";
  }
}

// Fun��o para a busca
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

// Chamar a fun��o de buscar dados assim que a p�gina carregar
window.onload = fetchData;