const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

let currentScene = null;

async function authFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }

  return res;
}

function handleNearLimit(data) {
  if (data.nearLimit) {
    document.getElementById('limitWarning').classList.remove('hidden');
  }
}

async function loadUserInfo() {
  const res = await authFetch(`${AUTH_URL}/me`);
  const user = await res.json();
  document.getElementById('callCounter').textContent = `${user.api_calls} / 20 calls`;

  if (user.api_calls >= 15) {
    document.getElementById('limitWarning').classList.remove('hidden');
  }
}

async function loadSuggestion() {
  const nameEl = document.getElementById('sceneName');
  const applyBtn = document.getElementById('applyScene');
  nameEl.textContent = 'Loading...';
  applyBtn.classList.add('hidden');

  const res = await authFetch(`${LIGHTS_URL}/ai/suggestion`);

  if (!res.ok) {
    nameEl.textContent = 'Could not load suggestion';
    return;
  }

  currentScene = await res.json();
  nameEl.textContent = currentScene.scene;
  applyBtn.classList.remove('hidden');
  handleNearLimit(currentScene);
  await loadUserInfo();
}

document.getElementById('applyScene').addEventListener('click', async () => {
  if (!currentScene) {
    return;
  }

  await authFetch(`${LIGHTS_URL}/state`, {
    method: 'PUT',
    body: JSON.stringify({
      r: currentScene.r,
      g: currentScene.g,
      b: currentScene.b,
      brightness: currentScene.brightness
    })
  });

  await loadUserInfo();
});

document.getElementById('refreshSuggestion').addEventListener('click', loadSuggestion);

document.getElementById('sendCommand').addEventListener('click', async () => {
  const text = document.getElementById('commandInput').value.trim();

  if (!text) {
    return;
  }

  const resultEl = document.getElementById('commandResult');
  resultEl.textContent = 'Processing...';
  resultEl.classList.remove('hidden');

  const res = await authFetch(`${LIGHTS_URL}/ai/command`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });

  const data = await res.json();

  if (res.ok) {
    resultEl.textContent = `Applied: brightness ${data.settings.brightness}%, RGB(${data.settings.r}, ${data.settings.g}, ${data.settings.b})`;
    handleNearLimit(data);
  } else {
    resultEl.textContent = data.error || 'Command failed';
  }

  await loadUserInfo();
});

document.getElementById('turnOn').addEventListener('click', async () => {
  const res = await authFetch(`${LIGHTS_URL}/state`, {
    method: 'PUT',
    body: JSON.stringify({ power: true })
  });
  handleNearLimit(await res.json());
  await loadUserInfo();
});

document.getElementById('turnOff').addEventListener('click', async () => {
  const res = await authFetch(`${LIGHTS_URL}/state`, {
    method: 'PUT',
    body: JSON.stringify({ power: false })
  });
  handleNearLimit(await res.json());
  await loadUserInfo();
});

document.getElementById('brightnessSlider').addEventListener('input', (e) => {
  document.getElementById('brightnessVal').textContent = e.target.value;
});

document.getElementById('setBrightness').addEventListener('click', async () => {
  const value = parseInt(document.getElementById('brightnessSlider').value);
  const res = await authFetch(`${LIGHTS_URL}/state`, {
    method: 'PUT',
    body: JSON.stringify({ brightness: value })
  });
  handleNearLimit(await res.json());
  await loadUserInfo();
});

document.getElementById('setColor').addEventListener('click', async () => {
  const hex = document.getElementById('colorPicker').value;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const res = await authFetch(`${LIGHTS_URL}/state`, {
    method: 'PUT',
    body: JSON.stringify({ r, g, b })
  });
  handleNearLimit(await res.json());
  await loadUserInfo();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

loadUserInfo();
loadSuggestion();
