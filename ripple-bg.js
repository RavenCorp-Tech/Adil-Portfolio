(() => {
  // Respect reduced motion
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Inject minimal CSS for the background canvas
  const style = document.createElement("style");
  style.textContent = `
    .bg-canvas {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none; /* let the page receive interactions */
    }
    /* Ensure normal content stays above */
    body { position: relative; }
  `;
  document.head.appendChild(style);

  // Create the canvas
  const canvas = document.createElement("canvas");
  canvas.id = "bg-ripples";
  canvas.className = "bg-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  // Sizing with DPR
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  let vw = window.innerWidth, vh = window.innerHeight;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    canvas.width = Math.floor(vw * DPR);
    canvas.height = Math.floor(vh * DPR);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    // 1 unit = 1 CSS pixel
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // Theme-aware fade color (matches your CSS vars roughly)
  function getFillForTheme() {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    return theme === "light" ? "rgba(255,255,255,0.08)" : "rgba(11,18,32,0.08)";
  }
  let fadeFill = getFillForTheme();
  // Update on theme toggle if present
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", () => { setTimeout(() => { fadeFill = getFillForTheme(); }, 0); });

  // Ripple parameters (tweak for look/perf)
  const MAX_RIPPLES = 64;
  const SPEED_PX_PER_S = 240; // expansion speed
  const LIFE_MS = 1400;       // how long a ripple lives
  const RINGS = 3;            // how many visible rings per ripple
  const RING_GAP = 12;        // px gap between rings
  const MIN_EMIT_INTERVAL = 35; // ms throttle for pointermove

  const ripples = [];
  let lastEmit = 0;

  function emit(x, y, force = 1) {
    if (ripples.length > MAX_RIPPLES) ripples.shift();
    ripples.push({ x, y, t0: performance.now(), force });
  }

  function clientToCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
    // Coordinates are in CSS pixels; we already scaled context to CSS pixels.
  }

  window.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - lastEmit < MIN_EMIT_INTERVAL) return;
    lastEmit = now;
    const { x, y } = clientToCanvas(e);
    emit(x, y, Math.min(e.pressure || 0.5, 1));
  }, { passive: true });

  window.addEventListener("pointerdown", (e) => {
    const { x, y } = clientToCanvas(e);
    // A slightly stronger burst on click/tap
    for (let i = 0; i < 2; i++) emit(x, y, 1);
  }, { passive: true });

  // Pause when tab is hidden
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running) last = performance.now();
  });

  let last = performance.now();
  function tick(now) {
    if (!running) { requestAnimationFrame(tick); return; }
    const dt = Math.min(33, now - last); // clamp delta for stability
    last = now;

    // Soft trail fade to create water effect
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = fadeFill;
    ctx.fillRect(0, 0, vw, vh);

    // Draw ripples with a light-like blend
    ctx.save();
    ctx.globalCompositeOperation = "screen"; // brightens where rings overlap
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#22d3ee";
    ctx.filter = "blur(0.3px)";

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = now - r.t0;
      if (age > LIFE_MS) { ripples.splice(i, 1); continue; }

      const base = (age / 1000) * SPEED_PX_PER_S; // base radius
      const fade = 1 - (age / LIFE_MS); // overall alpha falloff

      for (let k = 0; k < RINGS; k++) {
        const radius = Math.max(0, base - k * RING_GAP);
        if (radius <= 0) continue;

        // Subtle shimmering using a sine tied to radius and time
        const wave = 0.5 + 0.5 * Math.sin((radius / 12) - now * 0.02);
        const alpha = Math.max(0, fade * (0.25 + 0.75 * wave)) * (0.7 - k * 0.18) * r.force;
        if (alpha < 0.02) continue;

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
