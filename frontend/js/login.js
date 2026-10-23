document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');

  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);

    const payload = JSON.parse(atob(data.token.split('.')[1]));

    if (payload.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});
