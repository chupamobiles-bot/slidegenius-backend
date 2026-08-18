// gemini_client.js — Native Gemini REST API client
// Works with all Google AI Studio key formats (AQ. and AIza.)

// Models tried in order when rate-limited. Lite models have higher free-tier RPD.
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
];

async function _callGemini(model, messages, { max_tokens = 8192, temperature = 0.7, response_format } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    ...(systemMsg && { systemInstruction: { parts: [{ text: systemMsg.content }] } }),
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

  return { status: resp.status, data: resp.ok ? await resp.json() : null, errText: resp.ok ? null : await resp.text() };
}

async function geminiChat(messages, { max_tokens = 8192, temperature = 0.7, response_format } = {}) {
  let lastErr = null;

  for (const model of GEMINI_MODELS) {
    const { status, data, errText } = await _callGemini(model, messages, { max_tokens, temperature, response_format });

    if (status === 429 || status === 404) {
      // Rate-limited or model not available — try next model
      lastErr = `Gemini error ${status} on ${model}: ${errText}`;
      console.warn(`[gemini_client] ${lastErr} — trying next model`);
      continue;
    }

    if (status !== 200) {
      throw new Error(`Gemini error ${status}: ${errText}`);
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.filter(p => p.text).map(p => p.text).join('') || '';
    console.log(`[gemini_client] used model: ${model}, output length: ${text.length}`);
    return { choices: [{ message: { content: text, role: 'assistant' } }] };
  }

  throw new Error(`All Gemini models exhausted. Last error: ${lastErr}`);
}

module.exports = { geminiChat };
