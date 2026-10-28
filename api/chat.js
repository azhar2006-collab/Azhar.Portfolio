const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 18;
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1500;

const requestBuckets = new Map();

const instructions = `You are Thor, the friendly AI guide on Syed Azhar Hussain's developer portfolio.

Help with whatever the visitor asks: explain concepts, brainstorm, write or debug code, give practical advice, and answer general-knowledge questions. Use web search for information that may have changed or needs current sources. When web sources are returned, cite them in your answer; the application also displays source links.

When asked about Syed, use only these portfolio facts: Syed Azhar Hussain is a Chennai-based B.E. Computer Science and Engineering student at The Meenakshi College of Engineering (2023–2027), and a Full Stack Developer. His listed technologies include React, JavaScript, Python, Node.js, Django, Flask, REST APIs, Firebase, SQL, MongoDB, and PostgreSQL. His portfolio features client work including VeeduVadagaikku, JP Holidays, 77 Fitness Studio, Aadhif's Homemade, UniHut Tax & Corpserv, Ktech Solutions, Webspide Technologies, Mithas Ice Cream, Crazeespot, Deliheaven, and Splash Computer. If a personal detail is not in the portfolio, say that it is not listed instead of guessing.

Be accurate, clear, and conversational. Match the visitor's level of detail, answer directly, and use concise structure for longer answers. Never claim to have performed an action outside this chat.`;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function allowRequest(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function withinRateLimit(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || 'unknown')
    .split(',')[0]
    .trim();
  const now = Date.now();
  const bucket = requestBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    requestBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) return false;
  bucket.count += 1;
  return true;
}

function normalizeMessages(body) {
  let messages = body && body.messages;
  if (typeof body === 'string') {
    try {
      messages = JSON.parse(body).messages;
    } catch {
      return null;
    }
  }
  if (!Array.isArray(messages)) return null;

  const normalized = messages
    .filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content);

  if (!normalized.length || normalized[normalized.length - 1].role !== 'user') return null;
  return normalized;
}

function extractReplyAndSources(responseData) {
  const parts = [];
  const sources = new Map();

  for (const item of responseData.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (content.type !== 'output_text') continue;
      if (content.text) parts.push(content.text);
      for (const annotation of content.annotations || []) {
        if (annotation.type !== 'url_citation' || !annotation.url) continue;
        try {
          const url = new URL(annotation.url);
          if (url.protocol === 'https:') {
            sources.set(url.href, { title: annotation.title || url.hostname, url: url.href });
          }
        } catch {
          // Ignore malformed citations from an API response.
        }
      }
    }
  }

  return {
    reply: parts.join('\n').trim() || (responseData.output_text || '').trim(),
    sources: [...sources.values()].slice(0, 5),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Use POST to ask Thor a question.' });
  }

  if (!allowRequest(req)) return sendJson(res, 403, { error: 'This chat request is not allowed.' });
  if (!withinRateLimit(req)) return sendJson(res, 429, { error: 'Too many questions at once. Please try again in a few minutes.' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return sendJson(res, 503, { error: 'Thor is not connected yet. Please try again later.' });

  const messages = normalizeMessages(req.body);
  if (!messages) return sendJson(res, 400, { error: 'Please send a question to Thor.' });

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-6-astra',
        instructions,
        tools: [{ type: 'web_search' }],
        input: messages,
        max_output_tokens: 700,
        store: false,
      }),
      signal: AbortSignal.timeout(45000),
    });

    const responseData = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error('OpenAI Responses API error:', apiResponse.status, responseData.error?.code || 'unknown');
      return sendJson(res, 502, { error: 'Thor could not get an answer right now. Please try again shortly.' });
    }

    const result = extractReplyAndSources(responseData);
    if (!result.reply) return sendJson(res, 502, { error: 'Thor could not form an answer this time. Please try again.' });
    return sendJson(res, 200, result);
  } catch (error) {
    console.error('Thor chat request failed:', error.name || 'Error');
    return sendJson(res, 502, { error: 'Thor could not connect right now. Please try again shortly.' });
  }
};
