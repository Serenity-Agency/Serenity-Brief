function scrollToHash(hash, updateUrl = true) {
  if (!hash || hash === "#") return;

  const target = document.querySelector(hash);
  if (!target) return;

  target.scrollIntoView({ block: "start", behavior: "smooth" });

  if (updateUrl && window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || !document.querySelector(hash)) return;

      event.preventDefault();
      scrollToHash(hash);
    });
  });

  if (window.location.hash) {
    window.requestAnimationFrame(() => scrollToHash(window.location.hash, false));
  }
});
