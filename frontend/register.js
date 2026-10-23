document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');
  const successEl = document.getElementById('success');

  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    errorEl.classList.add('hidden');
    successEl.textContent = 'Account created! Redirecting to login...';
    successEl.classList.remove('hidden');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});
