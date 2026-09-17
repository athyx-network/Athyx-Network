(function initParticles() {
  // Only create once
  if (document.getElementById("particlesCanvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "particlesCanvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "0",
    pointerEvents: "none"
  });
  document.body.insertBefore(canvas, document.body.firstChild);

  // Push all direct children (except canvas and scripts) above the particles
  Array.from(document.body.children).forEach(child => {
    if (child !== canvas && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
      const style = window.getComputedStyle(child);
      if (style.position === 'static') {
        child.style.position = 'relative';
      }
      if (style.zIndex === 'auto') {
        child.style.zIndex = '1';
      }
    }
  });

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationFrameId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function createParticles() {
    particles = [];
    const numParticles = Math.floor(window.innerWidth / 15);
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rootStyles = getComputedStyle(document.documentElement);
    let accentColor = rootStyles.getPropertyValue('--accent').trim();
    
    if (!accentColor || accentColor.startsWith('rgba')) {
        accentColor = '#f43f5e';
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    animationFrameId = requestAnimationFrame(drawParticles);
  }

  function toggleParticlesAnimation(active) {
    if (active) {
      if (!animationFrameId) {
        createParticles();
        drawParticles();
      }
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  const particlesActive = localStorage.getItem("athyx_flying_particles") === "true";
  toggleParticlesAnimation(particlesActive);

  window.addEventListener("message", (event) => {
    if (event.data && event.data.action === "athyx_flying_particles_change") {
      toggleParticlesAnimation(event.data.active);
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "athyx_flying_particles") {
      toggleParticlesAnimation(event.newValue === "true");
    }
  });
})();
