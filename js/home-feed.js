(() => {
  const produtosContainer = document.getElementById("sidebar-produtos-list");
  const servicosContainer = document.getElementById("sidebar-servicos-list");
  if (!produtosContainer && !servicosContainer) return;

  const produtosUrl = "https://script.google.com/macros/s/AKfycbyOvmxW2lzk-rrbDbd2K-e9_2joawZk81PsvEi1vIx7fzGFAx5C4Vj0Nq9XVo1OOagr9w/exec";
  const servicosUrl = "https://script.google.com/macros/s/AKfycbwL0SID-5D-XBaKWLnskHT_J_Xle3CLsmsXAih5YduBbjP28blfoNQYqI5ys6xKMHl0/exec";

  function formatarPreco(valor) {
    const num = Number(String(valor || "").replace(/\./g, "").replace(",", "."));
    if (!isFinite(num) || num <= 0) return "";
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function escolherImagem(produto) {
    return produto.imagePerfil || produto.imageUrl || produto.imageUrl1 || produto.imageUrl2 || produto.imageUrl3 || produto.imageUrl4;
  }

  function cardProduto(produto) {
    const imagem = escolherImagem(produto);
    const preco = formatarPreco(produto.price);
    const link = `vendas.html?produto=${encodeURIComponent(produto.id)}`;
    return `
      <article class="sidebar-product">
        <img src="${imagem}" alt="${produto.name}" loading="lazy" width="60" height="60">
        <div>
          <div class="price">${preco || "Consulte valor"}</div>
          <div>${produto.name}</div>
          <a href="${link}">Ver detalhes</a>
        </div>
      </article>
    `;
  }

  function escolherImagemServico(servico) {
    return servico.FOTO_PERFIL || servico.FOTO_1 || servico.FOTO_2 || servico.FOTO_3 || servico.FOTO_4;
  }

  function cardServico(servico) {
    const imagem = escolherImagemServico(servico);
    const titulo = servico.TITULO || "Serviço realizado";
    const descricao = servico.DESCRICAO || "";
    const id = servico.ID ? String(servico.ID).toLowerCase().replace(/[^a-z0-9_-]/g, "") : "";
    const link = id ? `servicos.html?servico=${encodeURIComponent(id)}` : "servicos.html";
    return `
      <article class="sidebar-card">
        <img src="${imagem}" alt="${titulo}" loading="lazy" width="84" height="84">
        <div>
          <h3>${titulo}</h3>
          <p>${descricao}</p>
          <a href="${link}">Ver detalhes</a>
        </div>
      </article>
    `;
  }

  if (produtosContainer) {
    fetch(produtosUrl)
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data.saida) ? data.saida : [];
        const recentes = lista.filter(item => item && item.id && item.name).slice(0, 4);
        if (!recentes.length) {
          produtosContainer.innerHTML = "<p class=\"sidebar-muted\">Nenhum produto disponível no momento.</p>";
          return;
        }
        produtosContainer.innerHTML = recentes.map(cardProduto).join("");
      })
      .catch(() => {
        produtosContainer.innerHTML = "<p class=\"sidebar-muted\">Não foi possível carregar os produtos agora.</p>";
      });
  }

  if (servicosContainer) {
    fetch(servicosUrl)
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data.saida) ? data.saida : [];
        const recentes = lista
          .filter(item => item && item.ID && item.TITULO)
          .reverse()
          .slice(0, 3);
        if (!recentes.length) {
          servicosContainer.innerHTML = "<p class=\"sidebar-muted\">Nenhum serviço disponível no momento.</p>";
          return;
        }
        servicosContainer.innerHTML = recentes.map(cardServico).join("");
      })
      .catch(() => {
        servicosContainer.innerHTML = "<p class=\"sidebar-muted\">Não foi possível carregar os serviços agora.</p>";
      });
  }
})();
