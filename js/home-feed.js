(() => {
  const servicosContainer = document.getElementById("sidebar-servicos-list");
  if (!servicosContainer) return;

  const servicosUrl = "https://script.google.com/macros/s/AKfycbwnz3jkHDoRYzYeFnMZbQ9xAFcjhX8uEtkR7k03B-GCHAApFf1ihCg__uA6IbWSIpVp/exec";

  function escapeHtml(valor) {
    return String(valor || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escolherImagemServico(servico) {
    return servico.FOTO_PERFIL || servico.FOTO_1 || servico.FOTO_2 || servico.FOTO_3 || servico.FOTO_4 || "img/logo.jpg";
  }

  function cardServico(servico) {
    const imagem = escapeHtml(escolherImagemServico(servico));
    const titulo = escapeHtml(servico.TITULO || "Serviço realizado");
    const descricao = escapeHtml(servico.DESCRICAO || "");
    const categoria = escapeHtml(servico.CATEGORIA || servico.categoria || "");
    const id = servico.ID ? String(servico.ID).toLowerCase().replace(/[^a-z0-9_-]/g, "") : "";
    const link = id ? `servicos.html?servico=${encodeURIComponent(id)}` : "servicos.html";

    return `
      <article class="sidebar-card">
        <img src="${imagem}" alt="${titulo} — serviço residencial realizado em Dourados, MS" loading="lazy" width="84" height="84">
        <div>
          ${categoria ? `<span class="servico-categoria sidebar-categoria">${categoria}</span>` : ""}
          <h3>${titulo}</h3>
          <p>${descricao}</p>
          <a href="${link}">Ver detalhes</a>
        </div>
      </article>
    `;
  }

  fetch(servicosUrl)
    .then(res => res.json())
    .then(data => {
      const lista = Array.isArray(data.saida) ? data.saida : [];
      const recentes = lista
        .filter(item => item && item.ID && item.TITULO)
        .reverse()
        .slice(0, 3);

      if (!recentes.length) {
        servicosContainer.innerHTML = '<p class="sidebar-muted">Nenhum serviço disponível no momento.</p>';
        return;
      }

      servicosContainer.innerHTML = recentes.map(cardServico).join("");
    })
    .catch(() => {
      servicosContainer.innerHTML = '<p class="sidebar-muted">Não foi possível carregar os serviços agora.</p>';
    });
})();
