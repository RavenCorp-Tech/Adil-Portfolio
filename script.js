// Theme
(function initTheme() {
  const key = "pref-theme";
  const saved = localStorage.getItem(key);
  // default is dark (from HTML attribute)
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(key, next);
    });
  }
})();

// Mobile nav
(function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// Reveal on scroll
(function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach(el => obs.observe(el));
})();

// Year
document.getElementById("year").textContent = String(new Date().getFullYear());

// Projects
async function loadProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  try {
    const res = await fetch("data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch projects.json");
    const projects = await res.json();
    if (!Array.isArray(projects)) throw new Error("Invalid projects format");
    const frag = document.createDocumentFragment();
    for (const p of projects) {
      const card = document.createElement("article");
      card.className = "project-card reveal visible";
      const comingSoon = p.comingSoon ? `<span class="tag">Coming soon</span>` : "";
      card.innerHTML = `
        <div class="project-media">
          ${p.image ? `<img src="${p.image}" alt="${p.title} screenshot" loading="lazy" />` : `<span class="tag">No image</span>`}
        </div>
        <div class="project-body">
          <h3>${p.title} ${comingSoon}</h3>
          <p>${p.description ?? ""}</p>
          ${Array.isArray(p.tags) ? `<div class="project-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
        </div>
        <div class="project-links">
          ${p.links?.live ? `<a href="${p.links.live}" target="_blank" rel="noopener">Live</a>` : ""}
          ${p.links?.source ? `<a href="${p.links.source}" target="_blank" rel="noopener">Source</a>` : ""}
        </div>
      `;
      frag.appendChild(card);
    }
    grid.replaceChildren(frag);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="small">Unable to load projects. Update data/projects.json or check console.</p>`;
  }
}
loadProjects();

// Show resume button if resume.pdf exists (works on GitHub Pages / HTTP)
(async function showResumeIfExists() {
  const btn = document.getElementById("resume-btn");
  if (!btn) return;
  try {
    const res = await fetch("resume.pdf", { method: "HEAD" });
    if (res.ok) btn.hidden = false;
  } catch (_) {
    // ignore when running locally with file://
  }
})();

// Contact form
(function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  function setInvalid(el, invalid) {
    el.setAttribute("aria-invalid", invalid ? "true" : "false");
  }
  function validate(form) {
    const name = form.elements.namedItem("name");
    const email = form.elements.namedItem("email");
    const message = form.elements.namedItem("message");
    let ok = true;

    if (!name.value || name.value.trim().length < 2) { setInvalid(name, true); ok = false; } else setInvalid(name, false);

    const emailVal = (email.value || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) { setInvalid(email, true); ok = false; } else setInvalid(email, false);

    if (!message.value || message.value.trim().length < 10) { setInvalid(message, true); ok = false; } else setInvalid(message, false);

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sending...";

    // Honeypot
    if ((form.querySelector('input[name="website"]')?.value || "").trim() !== "") {
      status.textContent = "Spam detected.";
      return;
    }
    if (!validate(form)) {
      status.textContent = "Please correct the highlighted fields.";
      return;
    }

    const endpoint = form.getAttribute("action");
    const data = new FormData(form);

    // If no endpoint configured, open email app with prefilled content
    if (!endpoint) {
      const name = encodeURIComponent(data.get("name"));
      const email = encodeURIComponent(data.get("email"));
      const message = encodeURIComponent(data.get("message"));
      const subject = encodeURIComponent(`Portfolio contact from ${data.get("name")}`);
      const body = encodeURIComponent(`Name: ${decodeURIComponent(name)}\nEmail: ${decodeURIComponent(email)}\n\n${decodeURIComponent(message)}`);
      window.location.href = `mailto:ravencorp.tech@gmail.com?subject=${subject}&body=${body}`;
      status.textContent = "Opening your email app...";
      form.reset();
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        form.reset();
        status.textContent = "Thanks! Your message has been sent.";
      } else {
        status.textContent = "Something went wrong. Please email me directly.";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "Network error. Please email me directly.";
    }
  });
})();
