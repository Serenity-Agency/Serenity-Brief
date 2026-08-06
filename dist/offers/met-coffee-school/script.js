(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".topnav a"));
  var sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) {
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }

      links.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-32% 0px -56% 0px", threshold: 0.01 });

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
