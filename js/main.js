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

// Contact form submission via Web3Forms (AJAX, with inline feedback)
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    // While editing the page (content.js edit mode), never actually send
    if (document.body.classList.contains("rdw-editing")) return;
    e.preventDefault();

    if (status) {
      status.textContent = "Bezig met verzenden…";
      status.className = "form-status is-sending";
    }

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (res.ok && res.data.success) {
          form.reset();
          if (status) {
            status.textContent =
              "Bedankt voor je bericht! Het is verzonden en er wordt zo snel mogelijk gereageerd.";
            status.className = "form-status is-success";
          }
        } else {
          if (status) {
            status.textContent =
              "Het bericht kon niet worden verzonden" +
              (res.data && res.data.message ? " (" + res.data.message + ")" : "") +
              ". Probeer het later opnieuw of mail rechtstreeks.";
            status.className = "form-status is-error";
          }
        }
      })
      .catch(function () {
        if (status) {
          status.textContent =
            "Het bericht kon niet worden verzonden. Controleer je internetverbinding en probeer het opnieuw.";
          status.className = "form-status is-error";
        }
      });
  });
})();
