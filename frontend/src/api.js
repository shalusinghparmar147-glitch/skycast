
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, signal) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err; // cancelled on purpose, not a real error
    throw new Error('Cannot reach the SkyCast server. Check your connection and try again.');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Something went wrong. Please try again.');
  }
  return body;
}

export const fetchWeather = (q, signal) =>
  request(`/api/weather?q=${encodeURIComponent(q)}`, signal);

export const searchCities = (q, signal) =>
  request(`/api/search?q=${encodeURIComponent(q)}`, signal);
