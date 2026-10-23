const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

const payload = JSON.parse(atob(token.split('.')[1]));

if (payload.role !== 'admin') {
  window.location.href = 'dashboard.html';
}

async function loadUsers() {
  const res = await fetch(`${AUTH_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const users = await res.json();
  const tbody = document.getElementById('userTable');

  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-700';

    const tdId = document.createElement('td');
    tdId.className = 'px-4 py-3';

    const tdEmail = document.createElement('td');
    tdEmail.className = 'px-4 py-3';

    const tdRole = document.createElement('td');
    tdRole.className = 'px-4 py-3';

    const tdCalls = document.createElement('td');
    tdCalls.className = 'px-4 py-3';

    tdId.textContent = user.id;
    tdEmail.textContent = user.email;
    tdRole.textContent = user.role;
    tdCalls.textContent = `${user.api_calls} / 20`;

    tr.append(tdId, tdEmail, tdRole, tdCalls);
    tbody.appendChild(tr);
  });
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

loadUsers();
