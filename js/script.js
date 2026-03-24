const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

sections.forEach(section => {
  observer.observe(section);
});

const scrollTopBtn = document.querySelector(".btn-scroll-top");
if (scrollTopBtn) {
  const toggleScrollTop = () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("is-visible");
    } else {
      scrollTopBtn.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", toggleScrollTop, { passive: true });
  toggleScrollTop();
}
