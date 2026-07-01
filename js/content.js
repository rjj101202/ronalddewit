/* ============================================================
   Editable content system for Ronald de Wit Consulting.

   - Reads default content from /data/content.json
   - Overlays any local edits saved in localStorage
   - Applies photos to [data-edit-img] slots and URLs to
     [data-edit-link] links
   - Edit mode (open any page with ?edit=1) lets you upload
     photos and change links, then download an updated
     content.json to commit to the repository.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "rdw-content-v1";
  var EDIT_FLAG = "rdw-edit";
  var CONTENT_URL = "/data/content.json";
  var MAX_DIM = 1600; // px — uploaded photos are downscaled to this

  var base = { images: {}, links: {}, positions: {} };
  var content = { images: {}, links: {}, positions: {} };

  /* ---------- storage helpers ---------- */

  function readOverrides() {
    try {
      var o = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        images: o.images || {},
        links: o.links || {},
        positions: o.positions || {},
      };
    } catch (e) {
      return { images: {}, links: {}, positions: {} };
    }
  }

  function writeOverrides(o) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
    } catch (e) {
      alert(
        "De foto kon niet lokaal worden opgeslagen (opslag vol). " +
          "Probeer een kleinere afbeelding."
      );
    }
  }

  function merge() {
    var o = readOverrides();
    content = {
      images: Object.assign({}, base.images, o.images),
      links: Object.assign({}, base.links, o.links),
      positions: Object.assign({}, base.positions, o.positions),
    };
  }

  /* ---------- apply content to the page ---------- */

  function applyContent() {
    document.querySelectorAll("[data-edit-img]").forEach(function (el) {
      var key = el.getAttribute("data-edit-img");
      var src = content.images[key];
      if (src) {
        el.style.backgroundImage = 'url("' + src + '")';
        el.classList.remove("is-empty");
      } else {
        el.style.backgroundImage = "";
        el.classList.add("is-empty");
      }
      var pos = content.positions[key];
      if (pos) el.style.backgroundPosition = pos;
    });
    document.querySelectorAll("[data-edit-link]").forEach(function (el) {
      var key = el.getAttribute("data-edit-link");
      var url = content.links[key];
      if (url) el.setAttribute("href", url);
    });
    if (document.body.classList.contains("rdw-editing")) updateEditHints();
  }

  function updateEditHints() {
    document.querySelectorAll("[data-edit-img]").forEach(function (el) {
      var empty = el.classList.contains("is-empty");
      var hint = el.querySelector(".edit-photo-hint");
      var btn = el.querySelector(".edit-photo-replace");
      if (hint) {
        hint.textContent = empty
          ? "Klik om een foto te uploaden"
          : "Sleep om de foto te positioneren";
      }
      if (btn) btn.textContent = empty ? "Foto kiezen" : "Vervang foto";
    });
  }

  /* ---------- edit mode ---------- */

  function editActive() {
    if (/(?:^|[?&])edit(?:=1)?(?:&|$)/.test(location.search)) {
      sessionStorage.setItem(EDIT_FLAG, "1");
    }
    return sessionStorage.getItem(EDIT_FLAG) === "1";
  }

  function fileToDataURL(file, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width,
          h = img.height;
        var scale = Math.min(1, MAX_DIM / Math.max(w, h));
        var cw = Math.round(w * scale),
          ch = Math.round(h * scale);
        var canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);
        var type = file.type === "image/png" ? "image/png" : "image/jpeg";
        cb(canvas.toDataURL(type, 0.85));
      };
      img.onerror = function () {
        cb(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveImage(key, dataURL) {
    var o = readOverrides();
    o.images[key] = dataURL;
    writeOverrides(o);
    merge();
    applyContent();
  }

  function saveLink(key, url) {
    var o = readOverrides();
    o.links[key] = url;
    writeOverrides(o);
    merge();
    applyContent();
  }

  function savePosition(key, pos) {
    var o = readOverrides();
    o.positions[key] = pos;
    writeOverrides(o);
    merge();
  }

  function buildFileInput() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    return input;
  }

  function enableEditMode() {
    document.body.classList.add("rdw-editing");

    var fileInput = buildFileInput();
    var activeKey = null;

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (file && activeKey) {
        fileToDataURL(file, function (dataURL) {
          saveImage(activeKey, dataURL);
        });
      }
      fileInput.value = "";
    });

    // Photo slots -> click to upload (empty) or drag to reposition (filled)
    document.querySelectorAll("[data-edit-img]").forEach(function (el) {
      var key = el.getAttribute("data-edit-img");

      var hint = document.createElement("span");
      hint.className = "edit-photo-hint";
      el.appendChild(hint);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "edit-photo-replace";
      el.appendChild(btn);

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        activeKey = key;
        fileInput.click();
      });

      // Empty slot: click anywhere to upload
      el.addEventListener("click", function () {
        if (el.classList.contains("is-empty")) {
          activeKey = key;
          fileInput.click();
        }
      });

      // Filled slot: drag to set the focal point (background-position)
      var dragging = false;
      function updatePos(e) {
        var r = el.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        el.style.backgroundPosition = x.toFixed(1) + "% " + y.toFixed(1) + "%";
      }
      el.addEventListener("pointerdown", function (e) {
        if (el.classList.contains("is-empty") || e.target === btn) return;
        dragging = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch (err) {}
        el.classList.add("rdw-dragging");
        updatePos(e);
      });
      el.addEventListener("pointermove", function (e) {
        if (dragging) updatePos(e);
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("rdw-dragging");
        savePosition(key, el.style.backgroundPosition || "50% 50%");
      }
      el.addEventListener("pointerup", endDrag);
      el.addEventListener("pointercancel", endDrag);
    });

    updateEditHints();

    // Editable links -> click to change URL
    document.querySelectorAll("[data-edit-link]").forEach(function (el) {
      el.classList.add("rdw-editable-link");
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var key = el.getAttribute("data-edit-link");
        var current = content.links[key] || el.getAttribute("href") || "";
        var label = (el.textContent || key).trim();
        var next = window.prompt("Link-URL voor “" + label + "”:", current);
        if (next !== null) saveLink(key, next.trim());
      });
    });

    buildToolbar();
  }

  function buildToolbar() {
    var bar = document.createElement("div");
    bar.className = "rdw-toolbar";
    bar.innerHTML =
      '<span class="rdw-toolbar-title">Bewerkmodus</span>' +
      '<span class="rdw-toolbar-hint">Klik op een fotoplek om te uploaden, of op een link om de URL te wijzigen.</span>' +
      '<button type="button" data-act="download">content.json downloaden</button>' +
      '<button type="button" data-act="reset">Wijzigingen wissen</button>' +
      '<button type="button" data-act="exit">Sluiten</button>';
    document.body.appendChild(bar);

    bar.addEventListener("click", function (e) {
      var act = e.target.getAttribute && e.target.getAttribute("data-act");
      if (act === "download") downloadContent();
      else if (act === "reset") resetContent();
      else if (act === "exit") exitEdit();
    });
  }

  function downloadContent() {
    var data = JSON.stringify(content, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert(
      "content.json is gedownload.\n\n" +
        "Plaats dit bestand in de map 'data/' van de repository " +
        "(vervang de bestaande data/content.json) en push naar GitHub. " +
        "Vercel publiceert de wijzigingen dan automatisch voor alle bezoekers."
    );
  }

  function resetContent() {
    if (
      confirm(
        "Alle lokale wijzigingen (foto's en links) wissen en terugzetten naar de opgeslagen versie?"
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      merge();
      applyContent();
    }
  }

  function exitEdit() {
    sessionStorage.removeItem(EDIT_FLAG);
    // strip ?edit from the URL and reload cleanly
    location.href = location.pathname;
  }

  /* ---------- boot ---------- */

  function init() {
    fetch(CONTENT_URL, { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : {};
      })
      .catch(function () {
        return {};
      })
      .then(function (data) {
        base = {
          images: (data && data.images) || {},
          links: (data && data.links) || {},
        };
        merge();
        applyContent();
        if (editActive()) enableEditMode();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
