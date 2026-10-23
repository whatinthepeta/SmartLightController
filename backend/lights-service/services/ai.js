const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  timeout: 15000
});

async function parseCommand(userText) {
  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a smart light controller. Translate the user\'s request into light settings. Respond with valid JSON only, no markdown. Format: {"brightness": 0-100, "r": 0-255, "g": 0-255, "b": 0-255}'
      },
      { role: 'user', content: userText }
    ],
    temperature: 0.3
  });
  return JSON.parse(response.choices[0].message.content);
}

async function suggestScene() {
  const now = new Date();
  const timeStr = now.toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true });

  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a smart light scene suggester. Respond with valid JSON only, no markdown. Format: {"scene": "Scene Name", "r": 0-255, "g": 0-255, "b": 0-255, "brightness": 0-100}'
      },
      {
        role: 'user',
        content: `It is currently ${timeStr}. Suggest an appropriate light scene for the mood and time of day.`
      }
    ],
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content);
}

module.exports = { parseCommand, suggestScene };
