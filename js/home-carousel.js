const slidesData = [
  {
    image: "img/casal-status.jpeg",
    imageAlt: "Profissional realizando manutenção residencial",
    eyebrow: "Manutenção residencial em Dourados",
    title: "Seu lar em boas mãos.",
    description: "Cuidado, confiança e capricho para resolver os reparos que fazem diferença no seu dia a dia.",
    buttonText: "Fazer orçamento",
    buttonLink: "#formulario",
    backgroundColor: "#34443d"
  },
  {
    image: "img/eletr.jpeg",
    imageAlt: "Serviço de instalação elétrica residencial",
    eyebrow: "Elétrica e pequenos reparos",
    title: "Segurança e cuidado em cada detalhe.",
    description: "Conte com ajuda especializada para instalações e reparos elétricos na sua casa.",
    buttonText: "Solicitar atendimento",
    buttonLink: "#formulario",
    backgroundColor: "#273943"
  },
  {
    image: "img/telhado.jpg",
    imageAlt: "Manutenção realizada em telhado residencial",
    eyebrow: "Reparos para sua casa",
    title: "Mais tranquilidade para você e sua família.",
    description: "Do telhado aos acabamentos, conte com um serviço organizado e orçamento transparente.",
    buttonText: "Pedir orçamento",
    buttonLink: "#formulario",
    backgroundColor: "#3f3931"
  }
];

const carousel = document.querySelector(".home-carousel");

if (carousel && slidesData.length > 0) {
  const track = carousel.querySelector("[data-carousel-track]");
  const pagination = carousel.querySelector("[data-carousel-pagination]");
  const previousButton = carousel.querySelector(".home-carousel__arrow--previous");
  const nextButton = carousel.querySelector(".home-carousel__arrow--next");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const slides = [];
  const bullets = [];
  const autoplayDelay = 5000;
  let activeIndex = 0;
  let autoplayTimer;
  let isHovered = false;
  let isFocused = false;
  let isPointerInteracting = false;
  let isTouching = false;

  slidesData.forEach((slideData, index) => {
    const slide = document.createElement("article");
    slide.className = "home-carousel__slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} de ${slidesData.length}`);
    slide.style.setProperty("--slide-background", slideData.backgroundColor);
    slide.inert = index !== activeIndex;
    slide.setAttribute("aria-hidden", String(index !== activeIndex));

    const image = document.createElement("img");
    image.className = "home-carousel__image";
    image.src = slideData.image;
    image.alt = slideData.imageAlt;
    image.loading = "eager";
    image.decoding = "async";

    const content = document.createElement("div");
    content.className = "home-carousel__content";

    const eyebrow = document.createElement("p");
    eyebrow.className = "home-carousel__eyebrow";
    eyebrow.textContent = slideData.eyebrow;

    const title = document.createElement(index === 0 ? "h1" : "h2");
    title.className = "home-carousel__title";
    title.textContent = slideData.title;

    const description = document.createElement("p");
    description.className = "home-carousel__description";
    description.textContent = slideData.description;

    const link = document.createElement("a");
    link.className = "home-carousel__cta";
    link.href = slideData.buttonLink;
    link.textContent = slideData.buttonText;

    content.append(eyebrow, title, description, link);
    slide.append(image, content);
    track.append(slide);
    slides.push(slide);

    const bullet = document.createElement("button");
    bullet.className = "home-carousel__bullet";
    bullet.type = "button";
    bullet.setAttribute("aria-label", `Mostrar destaque ${index + 1}: ${slideData.title}`);
    bullet.setAttribute("aria-current", String(index === activeIndex));
    bullet.addEventListener("click", () => showSlide(index, true));
    pagination.append(bullet);
    bullets.push(bullet);
  });

  function showSlide(index, resetAutoplay = false) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.inert = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
      bullets[slideIndex].setAttribute("aria-current", String(isActive));
    });

    if (resetAutoplay) {
      updateAutoplay();
    }
  }

  function updateAutoplay() {
    window.clearInterval(autoplayTimer);
    if (reducedMotion.matches || isHovered || isFocused || isTouching || document.hidden) {
      return;
    }
    autoplayTimer = window.setInterval(() => showSlide(activeIndex + 1), autoplayDelay);
  }

  previousButton.addEventListener("click", () => showSlide(activeIndex - 1, true));
  nextButton.addEventListener("click", () => showSlide(activeIndex + 1, true));

  carousel.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeIndex - 1, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeIndex + 1, true);
    }
  });

  carousel.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") {
      isHovered = true;
      updateAutoplay();
    }
  });
  carousel.addEventListener("pointerleave", event => {
    if (event.pointerType === "mouse") {
      isHovered = false;
      updateAutoplay();
    }
  });
  carousel.addEventListener("pointerdown", event => {
    isPointerInteracting = true;
    isFocused = false;
    if (event.pointerType === "touch") {
      isTouching = true;
    }
    updateAutoplay();
  });
  carousel.addEventListener("pointerup", () => {
    isPointerInteracting = false;
    isTouching = false;
    updateAutoplay();
  });
  carousel.addEventListener("pointercancel", () => {
    isPointerInteracting = false;
    isTouching = false;
    updateAutoplay();
  });
  carousel.addEventListener("focusin", () => {
    if (!isPointerInteracting) {
      isFocused = true;
      updateAutoplay();
    }
  });
  carousel.addEventListener("focusout", event => {
    if (!carousel.contains(event.relatedTarget)) {
      isFocused = false;
      updateAutoplay();
    }
  });
  document.addEventListener("visibilitychange", updateAutoplay);
  reducedMotion.addEventListener("change", updateAutoplay);

  showSlide(activeIndex);
  updateAutoplay();
}
