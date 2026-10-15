(() => {
  const API_BASE_URL = "https://script.google.com/macros/s/AKfycbytbab3mz-45fluEw6r20OGNQT3iRzIFN6VlAFSxaAkqXnxsOBXfJIU2fTckZKZGIA/exec";
  const API_SHEET_PARAMETER = "aba";
  const API_SHEET_NAME = "AntesEDepois";
  const REQUEST_TIMEOUT_MS = 10000;

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

  async function carregarAntesEDepois() {
    const container = document.querySelector(".gallery-grid");
    if (!container) return;

    const loadingMessage = createStatusMessage(
      "Carregando transformações do portfólio...",
      "gallery-status"
    );
    container.before(loadingMessage);

    const url = new URL(API_BASE_URL);
    url.searchParams.set(API_SHEET_PARAMETER, API_SHEET_NAME);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal
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

      const fragment = document.createDocumentFragment();
      cards.forEach(card => fragment.append(card));
      container.replaceChildren(fragment);
    } catch (error) {
      console.warn(
        "Não foi possível carregar o portfólio remoto; mantendo o conteúdo padrão.",
        error
      );
    } finally {
      window.clearTimeout(timeoutId);
      loadingMessage.remove();
    }
  }

  carregarAntesEDepois();
})();
