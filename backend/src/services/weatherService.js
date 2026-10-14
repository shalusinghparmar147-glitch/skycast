import { HttpError } from '../middleware/errors.js';
import { TTLCache } from '../utils/cache.js';

const weatherCache = new TTLCache(10 * 60 * 1000); 
const searchCache = new TTLCache(24 * 60 * 60 * 1000); 

async function callWeatherApi(path, params) {
  const host = process.env.RAPIDAPI_HOST || 'weatherapi-com.p.rapidapi.com';
  const url = `https://${host}${path}?${new URLSearchParams(params)}`;

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': host,
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new HttpError(504, 'The weather service is not responding. Please try again.');
  }

  const body = await response.json().catch(() => null);
  if (response.ok && body) return body;

  if (body?.error?.code === 1006) {
    throw new HttpError(404, 'City not found. Check the spelling and try again.');
  }
  if (response.status === 429) {
    throw new HttpError(503, 'The weather service is busy. Please try again in a minute.');
  }
 
  console.error(`Weather API error ${response.status}:`, body);
  throw new HttpError(502, 'Could not get the weather right now. Please try again later.');
}


const withHttps = (url) => (url?.startsWith('//') ? `https:${url}` : url);


function shapeForecast(raw) {
  const { location, current, forecast } = raw;
  const today = forecast.forecastday[0];
  const hourly = forecast.forecastday
    .flatMap((day) => day.hour)
    .filter((hour) => hour.time_epoch > location.localtime_epoch - 3600)
    .slice(0, 24)
    .map((hour) => ({
      time: hour.time,
      tempC: hour.temp_c,
      tempF: hour.temp_f,
      condition: hour.condition.text,
      icon: withHttps(hour.condition.icon),
      chanceOfRain: hour.chance_of_rain,
    }));

  return {
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      localTime: location.localtime,
    },
    current: {
      tempC: current.temp_c,
      tempF: current.temp_f,
      feelsLikeC: current.feelslike_c,
      feelsLikeF: current.feelslike_f,
      condition: current.condition.text,
      icon: withHttps(current.condition.icon),
      isDay: current.is_day === 1,
      humidity: current.humidity,
      windKph: current.wind_kph,
      windDir: current.wind_dir,
      uv: current.uv,
      visibilityKm: current.vis_km,
      sunrise: today.astro.sunrise,
      sunset: today.astro.sunset,
      updatedAt: current.last_updated,
    },
    hourly,
    daily: forecast.forecastday.map((day) => ({
      date: day.date,
      maxC: day.day.maxtemp_c,
      maxF: day.day.maxtemp_f,
      minC: day.day.mintemp_c,
      minF: day.day.mintemp_f,
      condition: day.day.condition.text,
      icon: withHttps(day.day.condition.icon),
      chanceOfRain: day.day.daily_chance_of_rain,
    })),
  };
}

export async function getForecast(q) {
  const key = q.toLowerCase();
  const cached = weatherCache.get(key);
  if (cached) return cached;

  const raw = await callWeatherApi('/forecast.json', { q, days: 3 });
  const data = shapeForecast(raw);
  weatherCache.set(key, data);
  return data;
}

export async function searchCities(q) {
  const key = q.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  const raw = await callWeatherApi('/search.json', { q });
  const cities = raw.map((city) => ({
    id: city.id,
    name: city.name,
    region: city.region,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  }));
  searchCache.set(key, cities);
  return cities;
}
