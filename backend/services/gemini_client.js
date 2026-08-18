// gemini_client.js — Native Gemini REST API client
// Works with all Google AI Studio key formats (AQ. and AIza.)

const GEMINI_MODEL = 'gemini-2.5-flash';

async function geminiChat(messages, { max_tokens = 2048, temperature = 0.7, response_format } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // Separate system message from conversation
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  // Convert to Gemini format
  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    ...(systemMsg && {
      systemInstruction: { parts: [{ text: systemMsg.content }] },
    }),
    generationConfig: {
      maxOutputTokens: max_tokens,
      temperature,
      ...(response_format?.type === 'json_object' && { responseMimeType: 'application/json' }),
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Return in OpenAI-compatible shape so existing code works unchanged
  return { choices: [{ message: { content: text, role: 'assistant' } }] };
}

module.exports = { geminiChat };
