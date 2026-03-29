/* ============================================================
   AI Career Navigator — resume.js
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const wrapper    = document.getElementById('contentWrapper');
  const loadingMsg = document.getElementById('loadingMsg');
  const toolbar    = document.getElementById('toolbar');

  const params = new URLSearchParams(window.location.search);
  const index  = parseInt(params.get('index'));

  if (isNaN(index)) {
    loadingMsg.innerHTML = `
      <h2>Invalid Link</h2>
      <p>Please access this page through the <a href="dashboard.html">Dashboard</a>.</p>`;
    return;
  }

  let history = [];
  try { history = JSON.parse(localStorage.getItem('ai_career_history')) || []; } catch(e) {}

  const profile = history[index];
  if (!profile || !profile.result) {
    loadingMsg.innerHTML = `
      <h2>Profile Not Found</h2>
      <p>This profile may have been deleted. <a href="dashboard.html">Return to Dashboard.</a></p>`;
    return;
  }

  loadingMsg.style.display = 'none';

  const ai  = profile.result;
  const top = (ai.careers && ai.careers[0]) || { title: 'Aspiring Professional', description: '' };

  const skillsHtml = (ai.required_skills || []).map(s =>
    `<span class="skill-pill">${s}</span>`
  ).join('');

  const roadmapHtml = (ai.roadmap || []).map((r, i) =>
    `<div class="roadmap-item">
      <span class="roadmap-num">${String(i+1).padStart(2,'0')}</span>
      <p class="roadmap-text">${r}</p>
    </div>`
  ).join('');

  const careersHtml = (ai.careers || []).map(c =>
    `<div class="bg-row">
      <p class="bg-row-label">${c.title}</p>
      <p class="bg-row-value">${c.description}</p>
    </div>`
  ).join('');

  wrapper.innerHTML = `
    <div class="resume-page">

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <h1 class="sidebar-name">AI Generated Applicant</h1>
        <p class="sidebar-role">${top.title}</p>
        <div class="sidebar-divider"></div>

        <div class="sidebar-section">
          <p class="sidebar-label">Contact</p>
          <div class="contact-item">
            <span class="contact-icon">✉</span>
            <span>contact@example.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">☎</span>
            <span>+91 00000 00000</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">⚲</span>
            <span>India</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">⊹</span>
            <span>linkedin.com/in/applicant</span>
          </div>
        </div>

        <div class="sidebar-section">
          <p class="sidebar-label">Core Skills</p>
          ${skillsHtml || '<p class="sidebar-text">Not specified</p>'}
        </div>

        <div class="sidebar-section">
          <p class="sidebar-label">My Interests</p>
          <p class="sidebar-text">${profile.interests || 'N/A'}</p>
        </div>

        <div class="sidebar-section">
          <p class="sidebar-label">Expected CTC</p>
          <p class="sidebar-text" style="font-size:1.1rem;font-weight:600;color:#fff;">${ai.salary_india || 'N/A'}</p>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="main-content">

        <div class="resume-section">
          <h2 class="resume-section-title">Professional Summary</h2>
          <p class="summary-text">
            A motivated and results-oriented professional pursuing the role of
            <strong>${top.title}</strong>. ${top.description}
            With a strong foundation in <em>${(profile.interests || '').substring(0, 60)}</em>
            and core expertise in <em>${(profile.skills || '').substring(0, 60)}</em>,
            I am committed to continuous learning and delivering exceptional outcomes.
            Leveraging AI-driven career insights to align personal strengths with
            market opportunities.
          </p>
        </div>

        <div class="resume-section">
          <h2 class="resume-section-title">Career Goals & Roadmap</h2>
          ${roadmapHtml || '<p class="summary-text">Roadmap not generated.</p>'}
        </div>

        <div class="resume-section">
          <h2 class="resume-section-title">Career Directions</h2>
          ${careersHtml}
        </div>

        <div class="resume-section">
          <h2 class="resume-section-title">Background</h2>
          <div class="bg-row">
            <p class="bg-row-label">Current / Existing Skills</p>
            <p class="bg-row-value">${profile.skills || 'N/A'}</p>
          </div>
          <div class="bg-row">
            <p class="bg-row-label">Primary Interests</p>
            <p class="bg-row-value">${profile.interests || 'N/A'}</p>
          </div>
        </div>

      </div>
    </div>
  `;

  toolbar.style.display = 'flex';
});
