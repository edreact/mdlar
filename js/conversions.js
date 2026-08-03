(() => {
  function enviarEvento(nome, parametros = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: nome, ...parametros });

    if (typeof window.gtag === "function") {
      window.gtag("event", nome, parametros);
    }
  }

  document.addEventListener("click", event => {
    const whatsapp = event.target.closest('a[href^="https://wa.me/"]');
    if (whatsapp) {
      enviarEvento("whatsapp_click", {
        event_category: "lead",
        event_label: whatsapp.textContent.trim() || whatsapp.href
      });
      return;
    }

    const orcamento = event.target.closest('a[href="#formulario"], a[href="/#formulario"]');
    if (orcamento) {
      enviarEvento("orcamento_cta_click", {
        event_category: "lead",
        event_label: orcamento.textContent.trim() || "Solicitar orçamento"
      });
    }
  });

  const contato = document.forms.contact;
  if (contato) {
    contato.addEventListener("submit", () => {
      enviarEvento("orcamento_form_submit", {
        event_category: "lead",
        event_label: "Formulário de orçamento"
      });
    });
  }

  if (location.pathname.endsWith("/success.html")) {
    enviarEvento("orcamento_success", {
      event_category: "lead",
      event_label: "Página de obrigado"
    });
  }
})();
