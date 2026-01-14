// Theme
(function initTheme() {
  const key = "pref-theme";
  const saved = localStorage.getItem(key);
  // default is dark (from HTML attribute)
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  const btn = document.getElementById("theme-toggle");
  function setToggleIcon(theme) {
    if (!btn) return;
    const isLight = theme === 'light';
    // Use Ionicons: sunny for light, moon for dark
    btn.innerHTML = `<ion-icon name="${isLight ? 'sunny-outline' : 'moon-outline'}" aria-hidden="true"></ion-icon>`;
    btn.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  }
  // Initialize icon based on current theme
  setToggleIcon(document.documentElement.getAttribute('data-theme') || 'dark');
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "light" ? "dark" : "light";

      // Add global transition classes briefly
      const transitionTargets = [document.documentElement, document.body,
        document.querySelector('.site-header'),
        document.getElementById('nav-menu'),
        ...document.querySelectorAll('.project-card, .card, .chips li, .tag, .btn')
      ].filter(Boolean);
      transitionTargets.forEach(el => el.classList.add('theme-transition'));
      btn.classList.add('theming');

      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(key, next);
      setToggleIcon(next);
      // If switching to dark, force starfield regeneration
      if (next === 'dark') {
        window.__starsNeedsRegen = true;
      }
      if (typeof window.__regenStars === 'function') window.__regenStars();

      // Remove helper classes after transition completes
      setTimeout(() => {
        transitionTargets.forEach(el => el.classList.remove('theme-transition'));
        btn.classList.remove('theming');
      }, 400);
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

  // Touch-friendly activation for nav hover effect
  const items = menu.querySelectorAll('.fx-nav .fx-item');
  if (items.length) {
    let lastActive = null;
    items.forEach(li => {
      const link = li.querySelector('a.fx');
      if (!link) return;
      let tappedOnce = false;
      link.addEventListener('touchstart', (e) => {
        if (!li.classList.contains('active')) {
          // First tap: activate animation and prevent immediate navigation
          e.preventDefault();
          if (lastActive && lastActive !== li) lastActive.classList.remove('active');
          li.classList.add('active');
          lastActive = li;
          tappedOnce = true;
        } else if (tappedOnce) {
          // Second tap: allow navigation
          tappedOnce = false;
        }
      }, { passive: false });
    });
    // Tap outside to close active state
    document.addEventListener('touchstart', (e) => {
      if (!menu.contains(e.target)) {
        items.forEach(li => li.classList.remove('active'));
        lastActive = null;
      }
    }, { passive: true });
  }
})();

// Auto-hide header on scroll (hide when scrolling down, show on scroll up)
(function initAutoHideHeader() {
  const header = document.querySelector(".site-header");
  const menu = document.getElementById("nav-menu");
  if (!header) return;

  let lastY = Math.max(0, window.pageYOffset || window.scrollY);
  let down = 0, up = 0;
  const HIDE_AFTER = 16; // pixels of downward scroll before hiding
  const SHOW_AFTER = 8;  // pixels of upward scroll before showing

  function onScroll() {
    const y = Math.max(0, window.pageYOffset || window.scrollY);
    const dy = y - lastY;
    lastY = y;

    // Always show near top
    if (y <= 8) {
      header.classList.remove("hide");
      down = up = 0;
      return;
    }

    // Keep visible when mobile menu is open
    if (menu && menu.classList.contains("open")) {
      header.classList.remove("hide");
      return;
    }

    if (dy > 0) {
      // Scrolling down
      down += dy; up = 0;
      if (down > HIDE_AFTER) header.classList.add("hide");
    } else if (dy < 0) {
      // Scrolling up
      up += -dy; down = 0;
      if (up > SHOW_AFTER) header.classList.remove("hide");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
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
  const wrapper = document.getElementById("projects-wrapper");
  if (!wrapper) return;
  try {
    const res = await fetch("data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch projects.json");
    const projects = await res.json();
    if (!Array.isArray(projects)) throw new Error("Invalid projects format");
    const frag = document.createDocumentFragment();
    for (const p of projects) {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

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

      slide.appendChild(card);
      frag.appendChild(slide);
    }
    wrapper.replaceChildren(frag);

    // Initialize Swiper after slides are in the DOM
    const sliderEl = document.querySelector('.projects-slider');
    if (sliderEl && typeof Swiper !== 'undefined') {
      if (window.__projectsSwiper && typeof window.__projectsSwiper.destroy === 'function') {
        window.__projectsSwiper.destroy(true, true);
      }
      window.__projectsSwiper = new Swiper('.projects-slider', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: true,
        speed: 600,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        },
        pagination: { el: '.swiper-pagination', clickable: true }
      });
    }
  } catch (err) {
    console.error(err);
    const gridFallback = document.querySelector('.projects-slider');
    if (gridFallback) {
      gridFallback.innerHTML = `<p class="small">Unable to load projects. Update data/projects.json or check console.</p>`;
    }
  }
}
loadProjects();

// Badges (Swiper coverflow)
(function initBadgesSwiper() {
  const el = document.querySelector('.badges-slider');
  if (!el || typeof Swiper === 'undefined') return;

  if (window.__badgesSwiper && typeof window.__badgesSwiper.destroy === 'function') {
    window.__badgesSwiper.destroy(true, true);
  }

  window.__badgesSwiper = new Swiper('.badges-slider', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    speed: 600,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 2.5,
      slideShadows: false,
    },
    pagination: { el: '.badges-pagination', clickable: true }
  });
})();

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

    // If no endpoint configured, open email app with prefilled content (fallback)
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

// Starfield generator (replaces fallback shadows for richer field)
// Generates deterministic random positions for performance & consistency per session.
(function initStarfield(){
  const layers = [
    { id: 'stars', count: 700, size: 1 },
    { id: 'stars2', count: 200, size: 2 },
    { id: 'stars3', count: 100, size: 3 }
  ];
  function rand(max){ return Math.floor(Math.random()*max); }
  function build(count){
    const parts = new Array(count);
    for (let i=0;i<count;i++) {
      parts[i] = `${rand(2000)}px ${rand(2000)}px #FFF`;
    }
    return parts.join(', ');
  }
  function apply(){
    const dark = (document.documentElement.getAttribute('data-theme')||'dark') === 'dark';
    layers.forEach(l => {
      const el = document.getElementById(l.id);
      if (!el) return;
      if (!dark) {
        el.style.boxShadow = 'none';
        // Mark as needing regen next time we go dark
        el.dataset.generated = '';
        return;
      }
      // Keep existing if already generated (avoid layout thrash) unless resizing beyond threshold
      if (!el.dataset.generated || el.style.boxShadow === 'none' || window.__starsNeedsRegen) {
        el.style.boxShadow = build(l.count);
        el.dataset.generated = 'true';
      }
    });
    window.__starsNeedsRegen = false;
  }
  window.__regenStars = apply;
  // Regenerate on large viewport resize (debounced)
  let lastW = window.innerWidth, lastH = window.innerHeight; let to;
  window.addEventListener('resize', () => {
    clearTimeout(to);
    to = setTimeout(() => {
      const dw = Math.abs(window.innerWidth - lastW);
      const dh = Math.abs(window.innerHeight - lastH);
      if (dw > 200 || dh > 200) { // significant change
        lastW = window.innerWidth; lastH = window.innerHeight;
        window.__starsNeedsRegen = true;
        apply();
      }
    }, 280);
  }, { passive: true });
  // Initial
  document.addEventListener('DOMContentLoaded', apply);
})();

// (Removed) Logo Card Slider JS - replaced by simple hover effect on static logo

// Logo card 3D tilt on hover (mouse move)
(function initLogoTilt(){
  const card = document.querySelector('.logo-card');
  if (!card) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const maxTilt = 10; // degrees
  const damp = 0.9; // easing when leaving

  let rect = card.getBoundingClientRect();
  let raf = null;
  let targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      currentRX += (targetRX - currentRX) * 0.18;
      currentRY += (targetRY - currentRY) * 0.18;
      // Compose subtle scale for pop-out only while hovered;
      // translateZ is applied to inner layers via CSS var --pop
      const scale = card.matches(':hover') ? 1.03 : 1.0;
      card.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(${scale})`;
    });
  }

  function onMove(e){
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const cx = rect.width/2; const cy = rect.height/2;
    const dx = (x - cx) / cx; // -1..1
    const dy = (y - cy) / cy; // -1..1
    targetRY = dx * maxTilt;      // rotateY: left/right
    targetRX = -dy * maxTilt;     // rotateX: up/down (invert for natural feel)
    // move highlight
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    schedule();
  }

  function onEnter(){
    rect = card.getBoundingClientRect();
  }
  function onLeave(){
    targetRX = 0; targetRY = 0; schedule();
  }

  card.addEventListener('mouseenter', onEnter);
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', onLeave);
  // Touch support (optional gentle parallax)
  card.addEventListener('touchstart', onEnter, { passive: true });
  card.addEventListener('touchmove', onMove, { passive: true });
  card.addEventListener('touchend', onLeave, { passive: true });
})();

// Chatbot frontend logic (Raven AI)
(function initChatbot(){
  const icon = document.getElementById('chat-icon');
  const popup = document.getElementById('chat-popup');
  const closeBtn = document.getElementById('chat-close-btn');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  if (!icon || !popup || !closeBtn || !form || !input || !messages) return;
  // Backend base resolution:
  // - If window.CHAT_API_BASE defined, use it (allows production override)
  // - If same-origin dev (localhost:3000) keep relative path ('')
  // - Otherwise leave empty so fetch('/api/chat') will fail fast and we can show a helpful message
  //   instead of erroneously calling device-local localhost which breaks on mobile.
  const API_BASE = (() => {
    if (window.CHAT_API_BASE) return String(window.CHAT_API_BASE).replace(/\/$/, '');
    if (location.hostname === 'localhost' && location.port === '3000') return '';
    return ''; // Expect reverse proxy or same host; for GitHub Pages this must be set via window.CHAT_API_BASE.
  })();

  function openChat(){
    popup.style.display = 'flex';
    popup.classList.add('open');
    popup.setAttribute('aria-hidden','false');
    icon.setAttribute('aria-expanded','true');
    input.focus();
  }
  function closeChat(){
    popup.style.display = 'none';
    popup.classList.remove('open');
    popup.setAttribute('aria-hidden','true');
    icon.setAttribute('aria-expanded','false');
    icon.focus();
  }
  function toggleChat(){
    if (popup.classList.contains('open') || popup.style.display === 'flex') {
      closeChat();
    } else {
      openChat();
    }
  }
  icon.addEventListener('click', (e) => { e.stopPropagation(); toggleChat(); });
  icon.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleChat(); }});
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (popup.classList.contains('open') || popup.style.display === 'flex')) closeChat(); });
  document.addEventListener('click', e => {
    if ((popup.classList.contains('open') || popup.style.display === 'flex') && !popup.contains(e.target) && !icon.contains(e.target)) {
      closeChat();
    }
  });

  function addMessage(text, sender, opts={}){
    const wrap = document.createElement('div');
    wrap.className = 'chat-message ' + (sender === 'user' ? 'user-message' : 'raven-message');
    if (opts.id) wrap.id = opts.id;
    const p = document.createElement('p');
    p.textContent = text;
    wrap.appendChild(p);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }
  function removeTyping(){ const el = document.getElementById('typing-indicator'); if (el) el.remove(); }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addMessage(q, 'user');
    input.value = '';
    addMessage('Raven is typing…', 'raven', { id: 'typing-indicator' });
    try {
      const endpoint = (API_BASE ? `${API_BASE}/api/chat` : '/api/chat');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      if (!res.ok) throw new Error('Network error: ' + res.status);
      const data = await res.json();
      removeTyping();
      const answer = data.answer || "I'm sorry, ʿĀdil hasn't provided that information on his portfolio.";
      addMessage(answer, 'raven');
    } catch (err) {
      console.error('Chat error', err);
      removeTyping();
      const guidance = API_BASE === '' && !(location.hostname === 'localhost' && location.port === '3000')
        ? 'Backend not reachable. Define window.CHAT_API_BASE with your server URL.'
        : "Sorry, I'm having trouble connecting right now.";
      addMessage(guidance, 'raven');
    }
  });
})();
