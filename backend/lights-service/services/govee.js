const BASE_URL = 'https://developer-api.govee.com/v1/devices/control';

async function sendGoveeCommand(capability, value) {
  const body = {
    device: process.env.GOVEE_DEVICE_ID,
    model:  process.env.GOVEE_DEVICE_SKU,
    cmd: { name: capability, value }
  };

  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Govee-API-Key': process.env.GOVEE_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Govee API error ${res.status}: ${text}`);
  }
  return res.json();
}

module.exports = { sendGoveeCommand };
