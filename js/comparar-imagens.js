class CompararImagens extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --split: 50%;
          display: block;
          width: 100%;
          aspect-ratio: var(--comparison-ratio, 16 / 9);
          overflow: hidden;
          background: #e8e8e8;
        }

        .frame {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          isolation: isolate;
          cursor: ew-resize;
          touch-action: pan-y;
          user-select: none;
        }

        .layer {
          position: absolute;
          inset: 0;
        }

        .layer-after {
          clip-path: inset(0 0 0 var(--split));
        }

        slot {
          display: block;
          width: 100%;
          height: 100%;
        }

        ::slotted(img) {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .label {
          position: absolute;
          top: 12px;
          z-index: 1;
          padding: 5px 9px;
          border-radius: 999px;
          color: #fff;
          background: rgb(0 0 0 / 55%);
          font: 500 12px/1.2 Arial, sans-serif;
          pointer-events: none;
        }

        .label-before {
          left: 12px;
        }

        .label-after {
          right: 12px;
        }

        .divider {
          position: absolute;
          z-index: 2;
          top: 0;
          bottom: 0;
          left: var(--split);
          width: 2px;
          background: rgb(255 255 255 / 88%);
          transform: translateX(-50%);
          pointer-events: none;
        }

        .handle {
          position: absolute;
          z-index: 3;
          top: 50%;
          left: var(--split);
          display: grid;
          width: 44px;
          height: 44px;
          padding: 0;
          place-items: center;
          border: 2px solid rgb(255 255 255 / 95%);
          border-radius: 50%;
          color: #333;
          background: rgb(255 255 255 / 92%);
          box-shadow: 0 1px 8px rgb(0 0 0 / 22%);
          transform: translate(-50%, -50%);
          cursor: ew-resize;
          transition: scale 160ms ease;
          touch-action: pan-y;
        }

        .handle:hover,
        .handle:focus-visible {
          scale: 1.08;
        }

        .handle:focus-visible {
          outline: 3px solid #ffde59;
          outline-offset: 3px;
        }

        .arrows {
          display: flex;
          gap: 4px;
          font: 700 14px/1 Arial, sans-serif;
        }

        @media (prefers-reduced-motion: reduce) {
          .handle {
            transition: none;
          }
        }
      </style>
      <div class="frame">
        <div class="layer layer-before"><slot name="antes"></slot></div>
        <div class="layer layer-after"><slot name="depois"></slot></div>
        <span class="label label-before" aria-hidden="true">Antes</span>
        <span class="label label-after" aria-hidden="true">Depois</span>
        <div class="divider" aria-hidden="true"></div>
        <button class="handle" type="button" role="slider" aria-label="Comparar imagem antes e depois" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <span class="arrows" aria-hidden="true"><span>◀</span><span>▶</span></span>
        </button>
      </div>
    `;

    this.frame = this.shadowRoot.querySelector(".frame");
    this.handle = this.shadowRoot.querySelector(".handle");
    this.beforeSlot = this.shadowRoot.querySelector('slot[name="antes"]');
    this.abortController = null;
    this.dragging = false;
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.updateAspectRatio = this.updateAspectRatio.bind(this);
  }

  connectedCallback() {
    if (this.abortController) return;

    this.abortController = new AbortController();
    const { signal } = this.abortController;
    this.frame.addEventListener("pointerdown", this.onPointerDown, { signal });
    this.frame.addEventListener("pointermove", this.onPointerMove, { signal });
    this.frame.addEventListener("pointerup", this.onPointerUp, { signal });
    this.frame.addEventListener("pointercancel", this.onPointerUp, { signal });
    this.handle.addEventListener("keydown", this.onKeyDown, { signal });
    this.beforeSlot.addEventListener("slotchange", this.updateAspectRatio, { signal });
    this.updateAspectRatio();
    const position = this.getAttribute("position");
    const initialPosition = position === null ? 50 : Number(position);
    this.setPosition(Number.isFinite(initialPosition) ? initialPosition : 50);
    this.handle.setAttribute(
      "aria-label",
      this.getAttribute("aria-label") || "Comparar imagem antes e depois"
    );
  }

  disconnectedCallback() {
    this.abortController?.abort();
    this.abortController = null;
  }

  updateAspectRatio() {
    const before = this.beforeSlot
      .assignedElements({ flatten: true })
      .find(element => element instanceof HTMLImageElement);
    before?.addEventListener("load", this.updateAspectRatio, {
      signal: this.abortController.signal
    });
    const width = Number(before?.getAttribute("width"));
    const height = Number(before?.getAttribute("height"));

    if (width > 0 && height > 0) {
      this.style.setProperty("--comparison-ratio", `${width} / ${height}`);
    } else if (before?.naturalWidth > 0 && before?.naturalHeight > 0) {
      this.style.setProperty(
        "--comparison-ratio",
        `${before.naturalWidth} / ${before.naturalHeight}`
      );
    }
  }

  setPosition(position) {
    if (!Number.isFinite(position)) return;
    const value = Math.max(0, Math.min(100, position));
    this.style.setProperty("--split", `${value}%`);
    this.handle?.setAttribute("aria-valuenow", String(Math.round(value)));
  }

  onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    this.dragging = true;
    this.frame.setPointerCapture(event.pointerId);
    this.handle.focus({ preventScroll: true });
    this.updateFromPointer(event);
  }

  onPointerMove(event) {
    if (this.dragging) this.updateFromPointer(event);
  }

  onPointerUp(event) {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.frame.hasPointerCapture(event.pointerId)) {
      this.frame.releasePointerCapture(event.pointerId);
    }
  }

  updateFromPointer(event) {
    const bounds = this.frame.getBoundingClientRect();
    if (bounds.width === 0) return;
    this.setPosition(((event.clientX - bounds.left) / bounds.width) * 100);
  }

  onKeyDown(event) {
    const current = Number(this.handle.getAttribute("aria-valuenow"));
    const step = event.shiftKey ? 10 : 2;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        this.setPosition(current - step);
        break;
      case "ArrowRight":
      case "ArrowUp":
        this.setPosition(current + step);
        break;
      case "Home":
        this.setPosition(0);
        break;
      case "End":
        this.setPosition(100);
        break;
      default:
        return;
    }

    event.preventDefault();
  }
}

if (!customElements.get("comparar-imagens")) {
  customElements.define("comparar-imagens", CompararImagens);
}
