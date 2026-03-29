/* ============================================================
   AI Career Navigator — main.js
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

// ─── CUSTOM CURSOR ─────────────────────────────────────────
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
if (dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  })();
}

// ─── STAR CANVAS ────────────────────────────────────────────
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function makeStars(n) {
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.004,
        speed: Math.random() * 0.08
      });
    }
  }
  makeStars(180);

  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a = Math.max(0.05, Math.min(1, s.a + s.da));
      if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
      s.y -= s.speed;
      if (s.y < 0) { s.y = H; s.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 220, 255, ${s.a * 0.7})`;
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }
  drawStars();
})();

// ─── SCROLL REVEAL ──────────────────────────────────────────
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
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

// ─── FORM LOGIC ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roadmapForm');
  const generateBtn = document.getElementById('generateRoadmapBtn');
  const loadingSpinner = document.getElementById('loadingSpinnerRoadmap');
  const btnText = document.getElementById('btnTextRoadmap');
  const resultsSection = document.getElementById('roadmapResultsSection');
  const roadmapList = document.getElementById('newRoadmapList');
  const skillsList = document.getElementById('newSkillsList');
  const timeline = document.getElementById('roadmapTimeline');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      goalCareer: document.getElementById('goalCareer').value
    };

    try {
      setLoading(true);
      if(resultsSection) resultsSection.classList.add('hidden');

      const response = await fetch('http://localhost:5000/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Generation failed.');

      displayResults(data.data);

    } catch (err) {
      alert('⚠️ ' + err.message);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(active) {
    generateBtn.disabled = active;
    if (active) {
      btnText.textContent = 'MAPPING PATH...';
      loadingSpinner.classList.remove('hidden');
    } else {
      btnText.textContent = 'BUILD MY ROADMAP';
      loadingSpinner.classList.add('hidden');
    }
  }

  function displayResults(result) {
    // Roadmap
    roadmapList.innerHTML = '';
    (result.roadmap || []).forEach(step => {
      const el = document.createElement('li');
      el.textContent = step;
      roadmapList.appendChild(el);
    });

    // Skills
    skillsList.innerHTML = '';
    (result.required_skills || []).forEach(s => {
      const el = document.createElement('span');
      el.className = 'tag';
      el.textContent = s;
      skillsList.appendChild(el);
    });

    // Timeline
    if(result.timeline) {
      timeline.textContent = `${result.timeline} Months`;
    } else {
      timeline.textContent = '12-24 Months';
    }

    // Show & animate
    resultsSection.classList.remove('hidden');
    const panels = resultsSection.querySelectorAll('.result-panel');
    panels.forEach((p, i) => {
      p.classList.remove('fade-up', 'd1', 'd2', 'd3', 'd4');
      void p.offsetWidth;
      p.classList.add('fade-up', `d${i + 1}`);
    });

    setTimeout(() => {
      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = resultsSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }, 80);
  }
});

// ─── JOB SEARCH FILTERING ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('jobSearchInput');
  const cards = document.querySelectorAll('.job-card');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    cards.forEach(card => {
      const role = card.getAttribute('data-role').toLowerCase();
      const skills = card.getAttribute('data-skills').toLowerCase();

      if (role.includes(query) || skills.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ─── LIVE RESUME BUILDER ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('liveResumeForm');
  const previewContainer = document.getElementById('resumePreviewContainer');
  const output = document.getElementById('resumeOutput');
  const downloadBtn = document.getElementById('downloadPdfBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('resName').value || '';
    const email = document.getElementById('resEmail').value || '';
    const skills = document.getElementById('resSkills').value ? document.getElementById('resSkills').value.split(',').map(s => s.trim()).filter(s => s) : [];
    const edu = document.getElementById('resEdu').value || '';
    const experience = document.getElementById('experience').value || '';
    const projects = document.getElementById('projects').value || '';
    const port = document.getElementById('resPort').value || '';
    const git = document.getElementById('resGit').value || '';
    const link = document.getElementById('resLink').value || '';

    // Log the explicitly requested values for diagnostic binding check
    console.log("Experience value:", experience);
    console.log("Projects value:", projects);

    const skillsHtml = skills.map(s => `<span style="background:#e5e7eb; padding:2px 8px; border-radius:12px; font-size:0.85rem; margin-right:6px; display:inline-block; margin-bottom:6px;">${s}</span>`).join('');
    
    let linksHtml = '';
    if (port) linksHtml += `<a href="${port}" target="_blank" style="margin-right: 15px; color: #2563eb; text-decoration: none;">Portfolio</a>`;
    if (git) linksHtml += `<a href="${git}" target="_blank" style="margin-right: 15px; color: #2563eb; text-decoration: none;">GitHub</a>`;
    if (link) linksHtml += `<a href="${link}" target="_blank" style="color: #2563eb; text-decoration: none;">LinkedIn</a>`;

    let html = `
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h1 style="margin: 0; font-size: 2.2rem; color: #1e293b;">${name}</h1>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 1rem;">${email}</p>
        <div style="margin-top: 8px; font-size: 0.9rem;">${linksHtml}</div>
      </div>
    `;

    if (skills.length > 0) {
      html += `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #2563eb; font-size: 1.2rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2rem; margin-bottom: 0.8rem;">Core Competencies</h3>
        <div>${skillsHtml}</div>
      </div>`;
    }

    if (experience.trim() !== '') {
      html += `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #2563eb; font-size: 1.2rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2rem; margin-bottom: 0.8rem;">Professional Experience</h3>
        <p style="margin: 0; font-size: 0.95rem; color: #334155; white-space: pre-wrap;">${experience}</p>
      </div>`;
    }

    if (edu.trim() !== '') {
      html += `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #2563eb; font-size: 1.2rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2rem; margin-bottom: 0.8rem;">Education</h3>
        <p style="margin: 0; font-size: 0.95rem; color: #334155;">${edu}</p>
      </div>`;
    }

    if (projects.trim() !== '') {
      html += `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #2563eb; font-size: 1.2rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2rem; margin-bottom: 0.8rem;">Select Projects</h3>
        <p style="margin: 0; font-size: 0.95rem; color: #334155; white-space: pre-wrap;">${projects}</p>
      </div>`;
    }

    output.innerHTML = html;
    previewContainer.classList.remove('hidden');
    
    setTimeout(() => {
      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = previewContainer.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }, 50);
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const opt = {
        margin:       10,
        filename:     'AI_Generated_Resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      const element = document.getElementById('resumeOutput');
      html2pdf().set(opt).from(element).save();
    });
  }
});

// ─── AI TRANSITION MATRIX ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transitionForm');
  const resultContainer = document.getElementById('transitionResult');
  const btn = document.getElementById('btnTransition');
  const btnTxt = document.getElementById('txtTransition');
  const spinner = document.getElementById('spinTransition');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentSkills = document.getElementById('transCurrent').value;
    const targetCareer = document.getElementById('transTarget').value;

    try {
      // Loading State
      btn.disabled = true;
      btnTxt.textContent = 'ANALYZING...';
      spinner.classList.remove('hidden');
      if(resultContainer) resultContainer.classList.add('hidden');

      const response = await fetch('http://localhost:5000/api/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSkills, targetCareer })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Transition analysis failed.');

      const result = data.data;

      // Populate Data
      document.getElementById('transProgressText').textContent = `${result.progress_percentage || 0}%`;
      document.getElementById('transDiff').textContent = result.difficulty || 'Unknown';
      
      let diffColor = 'var(--emerald)';
      let diff = (result.difficulty || '').toLowerCase();
      if(diff.includes('high') || diff.includes('hard')) diffColor = '#ef4444';
      if(diff.includes('medium') || diff.includes('moderate')) diffColor = 'var(--amber)';
      document.getElementById('transDiff').style.borderColor = diffColor;
      document.getElementById('transDiff').style.color = diffColor;

      // Reset width for animation
      const bar = document.getElementById('transProgressBar');
      bar.style.width = '0%';

      document.getElementById('transTime').textContent = result.time_required || 'N/A';

      // Gap tags
      const gapContainer = document.getElementById('transGap');
      gapContainer.innerHTML = '';
      (result.skill_gap || []).forEach(gap => {
        const el = document.createElement('span');
        el.className = 'tag';
        el.style.border = '1px solid #ef4444';
        el.style.color = '#ef4444';
        el.style.background = 'transparent';
        el.textContent = gap;
        gapContainer.appendChild(el);
      });

      // Tips
      const tipsContainer = document.getElementById('transTips');
      tipsContainer.innerHTML = '';
      (result.smart_suggestions || []).forEach(tip => {
        const li = document.createElement('li');
        li.style.marginBottom = '0.5rem';
        li.textContent = tip;
        tipsContainer.appendChild(li);
      });

      // Show and animate
      resultContainer.classList.remove('hidden');
      
      setTimeout(() => {
        bar.style.width = `${result.progress_percentage || 0}%`;
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = resultContainer.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }, 50);

    } catch (err) {
      alert('⚠️ ' + err.message);
    } finally {
      btn.disabled = false;
      btnTxt.textContent = 'CALCULATE PIVOT';
      spinner.classList.add('hidden');
    }
  });
});

// ─── NAVBAR SMOOTH SCROLL & MOBILE TOGGLE ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  const navBar = document.querySelector('.navbar');

  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        const navHeight = navBar ? navBar.offsetHeight : 0;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Basic mobile menu toggle support if hamburger exists
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-center');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    
    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
});
