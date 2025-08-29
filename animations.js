// All animations for the site powered by anime.js
// This file assumes anime.min.js is loaded (via CDN) before this script.
// It is safe to run because <script defer> ensures DOM is ready.

(function heroIntro() {
  const root = document.querySelector(".hero");
  if (!root) return;

  const eyebrow = root.querySelector(".eyebrow");
  const title = root.querySelector("h1");
  const tagline = root.querySelector(".tagline");
  const summary = root.querySelector(".summary");
  const ctas = root.querySelectorAll(".cta .btn");

  // Start hidden for a nicer entrance (progressive enhancement)
  [eyebrow, title, tagline, summary, ...ctas].forEach(el => {
    if (el) el.style.opacity = "0";
  });

  const tl = anime.timeline({ easing: "easeOutQuad", duration: 500 });
  tl.add({ targets: eyebrow, opacity: [0, 1], translateY: [8, 0] }, 0)
    .add({ targets: title, opacity: [0, 1], translateY: [14, 0] }, 80)
    .add({ targets: tagline, opacity: [0, 1], translateY: [10, 0] }, 160)
    .add({ targets: summary, opacity: [0, 1], translateY: [10, 0] }, 240)
    .add({
      targets: ctas,
      opacity: [0, 1],
      translateY: [10, 0],
      delay: anime.stagger(60),
      duration: 420
    }, 320);
})();

(function projectsStaggerOnAppear() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  // Helper to run a stagger animation on current cards
  function animateCards(cards) {
    if (!cards.length) return;
    // Make sure cards are initially visible (your script injects them without hidden styles)
    anime({
      targets: cards,
      opacity: [
        { value: 0, duration: 0 },
        { value: 1, duration: 500 }
      ],
      translateY: [{ value: 24, duration: 0 }, { value: 0, duration: 500 }],
      easing: "easeOutQuad",
      delay: anime.stagger(60)
    });
  }

  // If cards are already present (SSR/local dev), animate them once
  const initialCards = grid.querySelectorAll(".project-card");
  if (initialCards.length) animateCards(initialCards);

  // Observe dynamic insertion (your script replaces children after fetching JSON)
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList" && m.addedNodes.length) {
        // Animate all cards that now exist
        const cards = grid.querySelectorAll(".project-card");
        requestAnimationFrame(() => animateCards(cards));
      }
    }
  });
  mo.observe(grid, { childList: true });
})();

(function themeToggleSpin() {
  const btn = document.getElementById("theme-toggle");
  const icon = btn?.querySelector("svg");
  if (!btn || !icon) return;

  btn.addEventListener("click", () => {
    anime({
      targets: icon,
      rotate: "+=180",
      duration: 450,
      easing: "easeInOutSine"
    });
  });
})();

(function mobileMenuDrop() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  // Animate when menu becomes open; leave close instant (to avoid fighting display:none)
  const openAnim = () => {
    // Ensure starting state
    menu.style.opacity = "0";
    menu.style.transform = "translateY(-8px)";
    anime({
      targets: menu,
      opacity: 1,
      translateY: 0,
      duration: 220,
      easing: "easeOutQuad"
    });
  };

  // Hook into clicks to run animation on opening
  toggle.addEventListener("click", () => {
    // next frame to let class "open" apply display, then animate
    requestAnimationFrame(() => {
      if (menu.classList.contains("open")) openAnim();
    });
  });
})();

(function smoothAnchorScroll() {
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  function scrollToTarget(id) {
    const el = document.querySelector(id);
    if (!el) return;

    const headerH = header?.offsetHeight || 0;
    const top = el.getBoundingClientRect().top + window.pageYOffset - (headerH + 8);

    anime({
      targets: [document.scrollingElement || document.documentElement, document.body],
      scrollTop: top,
      duration: 600,
      easing: "easeInOutQuad"
    });
  }

  links.forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      // Only intercept on same-page anchors
      if (href.startsWith("#")) {
        e.preventDefault();
        scrollToTarget(href);
        // Close mobile menu if open
        const menu = document.getElementById("nav-menu");
        const toggle = document.querySelector(".nav-toggle");
        if (menu?.classList.contains("open")) {
          menu.classList.remove("open");
          toggle?.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
})();
