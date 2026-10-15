(() => {
  const API_BASE_URL = "https://script.google.com/macros/s/AKfycbx4zwMuHbcki8xAulUNPPp90Q8wrdNQSfRMXE9ra7EDy2v7TfbKRgCoxaPgRdm6owzj/exec";
  const API_SHEET_PARAMETER = "aba";
  const API_SHEET_NAME = "AntesEDepois";

  function getImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    try {
      const url = new URL(value.trim(), document.baseURI);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function createPortfolioCard(item) {
    if (!item || typeof item !== "object") return null;

    const title = String(item.TITULO || "").trim();
    const description = String(item.DESCRICAO || title).trim();
    const beforeUrl = getImageUrl(item.ANTES);
    const afterUrl = getImageUrl(item.DEPOIS);

    if (!title || !description || !beforeUrl || !afterUrl) return null;

    const figure = document.createElement("figure");
    figure.className = "comparison-figure";

    const comparison = document.createElement("comparar-imagens");
    comparison.setAttribute("aria-label", `Comparar ${title}`);

    const beforeImage = document.createElement("img");
    beforeImage.slot = "antes";
    beforeImage.src = beforeUrl;
    beforeImage.alt = `${description} antes do reparo em Dourados, MS`;
    beforeImage.width = 1200;
    beforeImage.height = 800;
    beforeImage.loading = "lazy";
    beforeImage.decoding = "async";

    const afterImage = document.createElement("img");
    afterImage.slot = "depois";
    afterImage.src = afterUrl;
    afterImage.alt = `${description} — serviço concluído em Dourados, MS`;
    afterImage.width = 1200;
    afterImage.height = 800;
    afterImage.loading = "lazy";
    afterImage.decoding = "async";

    const caption = document.createElement("figcaption");
    caption.textContent = title;

    comparison.append(beforeImage, afterImage);
    figure.append(comparison, caption);
    return figure;
  }

  function createStatusMessage(text, className) {
    const message = document.createElement("p");
    message.className = className;
    message.setAttribute("role", "status");
    message.textContent = text;
    return message;
  }

  function setupGalleryNavigation() {
    const wrapper = document.querySelector(".gallery-carousel-wrapper");
    const container = wrapper?.querySelector(".gallery-grid");
    if (!wrapper || !container || wrapper.dataset.navigationReady === "true") return;

    wrapper.dataset.navigationReady = "true";
    wrapper.querySelector(".gallery-nav-btn.next")?.addEventListener("click", () => {
      const card = container.querySelector("figure");
      if (!card) return;
      const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 0;
      container.scrollBy({ left: card.getBoundingClientRect().width + gap, behavior: "smooth" });
    });
    wrapper.querySelector(".gallery-nav-btn.prev")?.addEventListener("click", () => {
      const card = container.querySelector("figure");
      if (!card) return;
      const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 0;
      container.scrollBy({ left: -(card.getBoundingClientRect().width + gap), behavior: "smooth" });
    });
  }

  async function carregarAntesEDepois() {
    const container = document.querySelector(".gallery-grid");
    if (!container) return;
    setupGalleryNavigation();

    const loadingMessage = createStatusMessage(
      "Carregando transformações do portfólio...",
      "gallery-status"
    );
    container.before(loadingMessage);

    const url = new URL(API_BASE_URL);
    url.searchParams.set(API_SHEET_PARAMETER, API_SHEET_NAME);

    try {
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`A API do portfólio respondeu com HTTP ${response.status}.`);
      }

      const dados = await response.json();
      const listaAba = dados.saida || [];

      if (!Array.isArray(listaAba)) {
        throw new TypeError("A propriedade 'saida' da API deve ser uma lista.");
      }

      if (listaAba.length === 0) {
        container.replaceChildren(
          createStatusMessage(
            "Novos serviços serão publicados em breve.",
            "gallery-empty"
          )
        );
        return;
      }

      const cards = [];
      listaAba.forEach(item => {
        const card = createPortfolioCard(item);
        if (card) cards.push(card);
      });
      if (cards.length === 0) {
        throw new TypeError("A API não retornou serviços de antes e depois válidos.");
      }

      container.innerHTML = "";
      cards.forEach(card => container.append(card));
    } catch (error) {
      console.warn(
        "Não foi possível carregar o portfólio remoto; mantendo o conteúdo padrão.",
        error
      );
    } finally {
      loadingMessage.remove();
    }
  }

  carregarAntesEDepois();
})();
