// /api/weather — proxies OpenWeatherMap so the API key never reaches the browser.
// Set OPENWEATHER_API_KEY in your Vercel project's Environment Variables.
//
// Usage from the client:
//   /api/weather?lat=51.5&lon=-0.12
//   /api/weather?city=London

export default async function handler(req, res) {
  const { lat, lon, city } = req.query;
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) {
    res.status(500).json({ message: 'OPENWEATHER_API_KEY is not set in your Vercel project environment variables.' });
    return;
  }

  let url;
  if (city) {
    url = 'https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(city) + '&units=metric&appid=' + key;
  } else if (lat && lon) {
    url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon) + '&units=metric&appid=' + key;
  } else {
    res.status(400).json({ message: 'Provide either lat & lon, or city.' });
    return;
  }

  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ message: 'Weather lookup failed.' });
  }
}
