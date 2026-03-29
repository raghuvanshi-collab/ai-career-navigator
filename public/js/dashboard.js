/* ============================================================
   AI Career Navigator — dashboard.js
   ============================================================ */



document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    if (document.documentElement.getAttribute('data-theme') === 'light') themeToggle.innerText = '☀️';
    else themeToggle.innerText = '🌙';

    themeToggle.addEventListener('click', () => {
      let current = document.documentElement.getAttribute('data-theme');
      if (current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerText = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.innerText = '☀️';
      }
    });
  }
});

// ─── CURSOR ──────────────────────────────────────────────────
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
if (dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

// ─── STARS ────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 120; i++) stars.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.2, a: Math.random(), da: (Math.random() - .5) * .004, speed: Math.random() * .06 });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a = Math.max(.05, Math.min(1, s.a + s.da)); if (s.a <= .05 || s.a >= 1) s.da *= -1;
      s.y -= s.speed; if (s.y < 0) { s.y = H; s.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,220,255,${s.a * .6})`; ctx.fill();
    }
    requestAnimationFrame(draw);
  })();
})();

// ─── NAVBAR MOBILE MENU & SCROLLING ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navCenter = document.querySelector('.nav-center');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (hamburger && navCenter) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navCenter.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        hamburger.classList.remove('active');
        navCenter.classList.remove('active');

        // Note: For cross-page links (e.g., from dashboard.html to index.html#features),
        // we only override default behavior if the user is already on the target page.
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    });
  }
});

// ─── DASHBOARD LOGIC ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('dashboardGrid');
  const loader = document.getElementById('loader');

  function loadHistory() {
    try {
      const profiles = JSON.parse(localStorage.getItem('ai_career_history')) || [];
      renderGrid(profiles);
    } catch (e) {
      grid.innerHTML = `<p style="color:#ef4444;font-family:var(--font-mono);font-size:.8rem;padding:2rem;">Error: ${e.message}</p>`;
    } finally {
      if (loader) loader.style.display = 'none';
    }
  }

  function renderGrid(profiles) {
    if (!profiles.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:5rem 2rem;">
          <p style="font-family:var(--font-display);font-size:3rem;letter-spacing:2px;color:var(--text-lo);margin-bottom:1rem;">NO PROFILES YET</p>
          <p style="color:var(--text-mid);font-family:var(--font-head);font-size:.95rem;">Head over to <a href="index.html" style="color:var(--cyan);text-decoration:none;">Generate</a> to create your first career analysis.</p>
        </div>`;
      return;
    }

    profiles.forEach((profile, index) => {
      const result = profile.result;
      if (!result) return;

      const date = new Date(profile.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      const careersHtml = (result.careers || []).slice(0, 3).map(c =>
        `<div class="career-mini">${c.title}</div>`
      ).join('');

      const skillsHtml = (result.required_skills || []).slice(0, 5).map(s =>
        `<span class="tag">${s}</span>`
      ).join('');

      const card = document.createElement('div');
      card.className = `glass-card history-card fade-up d${(index % 4) + 1}`;
      card.innerHTML = `
        <div class="card-index">${String(index + 1).padStart(2, '0')}</div>
        <div class="card-header">
          <div>
            <p class="card-date">${date}</p>
            <p class="card-title">Career Profile #${index + 1}</p>
          </div>
        </div>

        <div class="card-careers">
          ${careersHtml}
        </div>

        <div class="tags-container" style="margin-bottom:1.25rem;">${skillsHtml}</div>

        <div>
          <p class="salary-mini-label">Expected Salary</p>
          <p class="salary-mini">${result.salary_india || 'N/A'}</p>
        </div>

        <button class="btn-resume download-btn">
          ↗ View PDF Resume
        </button>
      `;

      card.querySelector('.download-btn').addEventListener('click', () => {
        window.location.href = `resume.html?index=${index}`;
      });

      grid.appendChild(card);
    });
  }

  loadHistory();
});
