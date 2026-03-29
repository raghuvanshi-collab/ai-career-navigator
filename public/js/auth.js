document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const isDashboard = window.location.pathname.includes('dashboard.html');

  // ─── 1. ROUTE PROTECTION ─────────────────────────────────────
  if (isDashboard && !token) {
    window.location.href = 'login.html';
    return;
  }

  // ─── 2. NAVBAR AUTH TOGGLE ───────────────────────────────────
  // Find only the sign-in buttons that are anchors (ignores Job form buttons)
  const navAuthBtns = document.querySelectorAll('a.btn-signin');
  navAuthBtns.forEach(btn => {
    if (token) {
      btn.textContent = 'Logout';
      btn.href = '#';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    } else {
      btn.textContent = 'Sign In';
      btn.href = 'login.html';
    }
  });

  // ─── 3. FORM HANDLERS ────────────────────────────────────────
  const showError = (msg) => {
    const errDiv = document.getElementById('authError');
    if (errDiv) {
      errDiv.textContent = msg;
      errDiv.style.display = 'block';
    }
  };

  const setBtnLoading = (btnId, isLoading, text) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const btnText = btn.querySelector('#btnText');
    const spinner = btn.querySelector('.spinner');
    
    if (isLoading) {
      btn.disabled = true;
      btnText.style.display = 'none';
      spinner.classList.remove('hidden');
    } else {
      btn.disabled = false;
      btnText.style.display = 'block';
      btnText.textContent = text;
      spinner.classList.add('hidden');
    }
  };

  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      setBtnLoading('loginBtn', true);
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to login');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } catch (err) {
        showError(err.message);
        setBtnLoading('loginBtn', false, 'SIGN IN');
      }
    });
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      setBtnLoading('registerBtn', true);
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register');

        // Note: The backend correctly sends token back on register!
        // So we can log them in automatically and redirect to dashboard, OR redirect to login
        // The user requirements said: "After success: Redirect to login page"
        window.location.href = 'login.html';
      } catch (err) {
        showError(err.message);
        setBtnLoading('registerBtn', false, 'SIGN UP');
      }
    });
  }
});
