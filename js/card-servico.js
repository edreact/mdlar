class CardServico extends HTMLElement {
  static get observedAttributes() {
    return ["img"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          min-width: 0;
          aspect-ratio: 1;
          color: #fff;
        }

        article {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          isolation: isolate;
          border-radius: 12px;
          background: #343434;
          box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
        }

        .image,
        .overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .image {
          z-index: -2;
          object-fit: cover;
          transition: transform 400ms ease;
        }

        .overlay {
          z-index: -1;
          background: linear-gradient(
            180deg,
            rgb(0 0 0 / 8%) 15%,
            rgb(0 0 0 / 24%) 48%,
            rgb(0 0 0 / 78%) 100%
          );
        }

        .content {
          position: absolute;
          inset: auto 0 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 22px;
        }

        ::slotted(h3) {
          margin: 0 0 8px;
          color: #fff;
          font-size: clamp(1.1rem, 2vw, 1.35rem);
          line-height: 1.25;
          text-shadow: 0 1px 4px rgb(0 0 0 / 45%);
        }

        .description {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(8px);
          transition: max-height 400ms ease, opacity 400ms ease, transform 400ms ease;
        }

        ::slotted(p) {
          margin: 0 0 14px;
          color: rgb(255 255 255 / 94%);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .toggle {
          min-height: 40px;
          padding: 8px 14px;
          border: 1px solid rgb(255 255 255 / 78%);
          border-radius: 999px;
          color: #fff;
          background: rgb(0 0 0 / 28%);
          font: 700 0.9rem/1.2 Arial, sans-serif;
          cursor: pointer;
          transition: background-color 400ms ease, color 400ms ease;
        }

        .toggle:hover,
        .toggle:focus-visible {
          color: #111;
          background: #fff;
        }

        .toggle:focus-visible {
          outline: 3px solid #ffde59;
          outline-offset: 3px;
        }

        .description.expanded,
        :host([expanded]) .description {
          max-height: 14em;
          opacity: 1;
          transform: translateY(0);
        }

        :host(:hover) .image,
        :host([expanded]) .image {
          transform: scale(1.04);
        }

        @media (hover: hover) {
          :host(:hover) .description {
            max-height: 14em;
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .image,
          .description,
          .toggle {
            transition: none;
          }
        }
      </style>
      <article>
        <img class="image" alt="" aria-hidden="true" loading="lazy" decoding="async">
        <div class="overlay" aria-hidden="true"></div>
        <div class="content">
          <slot name="titulo"></slot>
          <div class="description" id="service-description">
            <slot name="descricao"></slot>
          </div>
          <button class="toggle" type="button" aria-expanded="false" aria-controls="service-description">
            Saiba mais
          </button>
        </div>
      </article>
    `;

    this.image = this.shadowRoot.querySelector(".image");
    this.description = this.shadowRoot.querySelector(".description");
    this.toggleButton = this.shadowRoot.querySelector(".toggle");
    this.titleSlot = this.shadowRoot.querySelector('slot[name="titulo"]');
    this.lastExpandedScrollY = window.scrollY;
    this.onToggle = this.onToggle.bind(this);
    this.onRequestService = this.onRequestService.bind(this);
    this.onWindowScroll = this.onWindowScroll.bind(this);
    this.updateToggleLabel = this.updateToggleLabel.bind(this);
  }

  connectedCallback() {
    this.updateImage();
    this.toggleButton.addEventListener("click", this.onToggle);
    this.titleSlot.addEventListener("slotchange", this.updateToggleLabel);
    window.addEventListener("scroll", this.onWindowScroll, { passive: true });
    this.updateToggleLabel();
  }

  disconnectedCallback() {
    this.toggleButton.removeEventListener("click", this.onToggle);
    this.titleSlot.removeEventListener("slotchange", this.updateToggleLabel);
    window.removeEventListener("scroll", this.onWindowScroll);
  }

  attributeChangedCallback() {
    this.updateImage();
  }

  updateImage() {
    if (!this.image) return;
    const source = this.getAttribute("img");
    if (source) {
      this.image.src = source;
    } else {
      this.image.removeAttribute("src");
    }
  }

  updateToggleLabel() {
    const title = this.titleSlot
      .assignedElements({ flatten: true })
      .map(element => element.textContent.trim())
      .filter(Boolean)
      .join(" ");
    this.toggleButton.setAttribute(
      "aria-label",
      `${this.hasAttribute("expanded") ? "Solicitar orçamento para" : "Saiba mais sobre"} ${title || "este serviço"}`
    );
  }

  onToggle() {
    if (this.toggleButton.getAttribute("aria-expanded") === "true") {
      this.onRequestService();
      return;
    }

    this.lastExpandedScrollY = window.scrollY;
    this.toggleButton.setAttribute("aria-expanded", "true");
    this.toggleButton.textContent = "Solicitar este serviço";
    this.toggleButton.setAttribute(
      "aria-label",
      `Solicitar orçamento para ${
        this.titleSlot.assignedElements({ flatten: true })[0]?.textContent.trim() || "este serviço"
      }`
    );
    this.toggleAttribute("expanded", true);
    this.description.classList.add("expanded");
  }

  onWindowScroll() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      const scrollY = window.scrollY;
      if (
        this.hasAttribute("expanded") &&
        Math.abs(scrollY - this.lastExpandedScrollY) >= 24
      ) {
        this.closeCard();
      } else if (!this.hasAttribute("expanded")) {
        this.lastExpandedScrollY = scrollY;
      }
    }
  }

  closeCard() {
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.toggleButton.textContent = "Saiba mais";
    this.toggleButton.setAttribute(
      "aria-label",
      `Saiba mais sobre ${this.titleSlot.assignedElements({ flatten: true })[0]?.textContent.trim() || "este serviço"}`
    );
    this.removeAttribute("expanded");
    this.description.classList.remove("expanded");
    this.lastExpandedScrollY = window.scrollY;
  }

  onRequestService() {
    const formSection = document.querySelector("#formulario");
    const descriptionField = document.querySelector("#descricao");
    const nameField = document.querySelector("#nome");

    if (!formSection || !(descriptionField instanceof HTMLTextAreaElement) || !nameField) {
      console.warn("Não foi possível localizar todos os campos do formulário de orçamento.");
      return;
    }

    this.closeCard();

    const title = this.titleSlot
      .assignedElements({ flatten: true })
      .map(element => element.textContent.trim())
      .filter(Boolean)
      .join(" ") || "serviço residencial";

    descriptionField.value =
      `Olá, gostaria de solicitar um orçamento e mais informações sobre o serviço de ${title}.`;
    descriptionField.dispatchEvent(new Event("input", { bubbles: true }));
    descriptionField.dispatchEvent(new Event("change", { bubbles: true }));
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    nameField.focus({ preventScroll: true });
  }
}

if (!customElements.get("card-servico")) {
  customElements.define("card-servico", CardServico);
}
