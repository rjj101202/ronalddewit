// Mobile navigation toggle
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close the menu after clicking a link (mobile)
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// Reveal elements as they scroll into view (progressive enhancement)
(function () {
  var reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  // No IntersectionObserver support: just show everything, no animation
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  // Only hide-then-reveal once JS is running, so content stays visible if JS fails
  document.documentElement.classList.add("js-reveal");

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
  );

  reveals.forEach(function (el) {
    io.observe(el);
  });
})();
