(() => {
  const container = document.getElementById("sidebar-produtos-list");
  if (!container) return;

  const url = "https://script.google.com/macros/s/AKfycbyOvmxW2lzk-rrbDbd2K-e9_2joawZk81PsvEi1vIx7fzGFAx5C4Vj0Nq9XVo1OOagr9w/exec";

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

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const lista = Array.isArray(data.saida) ? data.saida : [];
      const recentes = lista.filter(item => item && item.id && item.name).slice(0, 4);
      if (!recentes.length) {
        container.innerHTML = "<p class=\"sidebar-muted\">Nenhum produto disponÃ­vel no momento.</p>";
        return;
      }
      container.innerHTML = recentes.map(cardProduto).join("");
    })
    .catch(() => {
      container.innerHTML = "<p class=\"sidebar-muted\">NÃ£o foi possÃ­vel carregar os produtos agora.</p>";
    });
})();
