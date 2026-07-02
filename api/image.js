// /api/image — proxies Google's Gemini image-generation model (gemini-2.5-flash-image,
// aka "Nano Banana") so the API key never reaches the browser.
// Set GEMINI_API_KEY in your Vercel project's Environment Variables — reuse the same
// key your /api/gemini route already uses, if you have one.
//
// Usage from the client: POST { "prompt": "a corgi wearing a tiny hat" }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'POST only.' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ message: 'GEMINI_API_KEY is not set in your Vercel project environment variables.' });
    return;
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    res.status(400).json({ message: 'Missing "prompt" in request body.' });
    return;
  }

  try {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] }
        })
      }
    );
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ message: 'Image generation failed.' });
  }
}
