import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather } from './api.js';
import { usePersistentState } from './hooks/usePersistentState.js';
import SearchBar from './components/SearchBar.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import DailyForecast from './components/DailyForecast.jsx';

const DEFAULT_CITY = 'New Delhi';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = usePersistentState('skycast:unit', 'C');
  const [recent, setRecent] = usePersistentState('skycast:recent', []);
  const requestRef = useRef(null);

  const loadWeather = useCallback(
    async (q) => {
      
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;

      setLoading(true);
      setError('');
      try {
        const data = await fetchWeather(q, controller.signal);
        setWeather(data);
        const label = `${data.location.name}, ${data.location.country}`;
        setRecent((prev) => [{ label, q }, ...prev.filter((item) => item.label !== label)].slice(0, 5));
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (requestRef.current === controller) setLoading(false);
      }
    },
    [setRecent]
  );

  
  useEffect(() => {
    loadWeather(recent[0]?.q ?? DEFAULT_CITY);
 
  }, []);

  function handleLocate() {
    if (!navigator.geolocation) {
      setError("This browser can't share your location. Search for a city instead.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadWeather(`${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`),
      () => {
        setLoading(false);
        setError('Location access is off. Allow it in your browser, or search for a city.');
      },
      { timeout: 10000 }
    );
  }

  const currentLabel = weather && `${weather.location.name}, ${weather.location.country}`;
  const otherRecent = recent.filter((item) => item.label !== currentLabel);

  return (
    <div className="app">
      <header className="top">
        <h1 className="wordmark">SkyCast Weather App</h1>
        <div className="units" role="group" aria-label="Temperature unit">
          <button type="button" aria-pressed={unit === 'C'} onClick={() => setUnit('C')}>
            °C
          </button>
          <button type="button" aria-pressed={unit === 'F'} onClick={() => setUnit('F')}>
            °F
          </button>
        </div>
      </header>

      <SearchBar onSearch={loadWeather} onLocate={handleLocate} />

      {otherRecent.length > 0 && (
        <nav className="recent" aria-label="Recent searches">
          <span className="recent-label">Recent</span>
          {otherRecent.map((item) => (
            <button type="button" key={item.label} className="chip" onClick={() => loadWeather(item.q)}>
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {!weather && loading && <p className="status">Loading the weather…</p>}

      {weather && (
        <main className={`content${loading ? ' is-loading' : ''}`} aria-busy={loading}>
          <CurrentWeather data={weather} unit={unit} />
          <HourlyForecast hours={weather.hourly} unit={unit} />
          <DailyForecast days={weather.daily} unit={unit} />
        </main>
      )}

      <footer className="foot">
       Weather data by{' '}
        <a href="https://www.weatherapi.com/" target="_blank" rel="noreferrer">
          WeatherAPI.com
        </a>
, served through RapidAPI.
      </footer>
    </div>
  );
}
