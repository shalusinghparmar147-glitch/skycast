import { formatClock, formatLongDate, formatTemp } from '../utils/format.js';

function skyFor(current) {
  if (!current.isDay) return 'night';
  if (/^cloudy|overcast|mist|fog|rain|drizzle|shower|sleet|snow|thunder|ice|blizzard/i.test(current.condition)) {
    return 'grey';
  }
  return 'day';
}

export default function CurrentWeather({ data, unit }) {
  const { location, current } = data;

  const stats = [
    ['Humidity', `${current.humidity}%`],
    ['Wind', `${Math.round(current.windKph)} km/h ${current.windDir}`],
    ['UV index', current.uv],
    ['Visibility', `${current.visibilityKm} km`],
    ['Sunrise', current.sunrise.replace(/^0/, '')], // "06:21 AM" → "6:21 AM"
    ['Sunset', current.sunset.replace(/^0/, '')],
  ];

  return (
    <section className={`now sky-${skyFor(current)}`} aria-label={`Current weather in ${location.name}`}>
      <div className="now-head">
        <div>
          <h2 className="place">{location.name}</h2>
          <p className="place-sub">{[location.region, location.country].filter(Boolean).join(', ')}</p>
        </div>
        <p className="as-of">
          {formatLongDate(location.localTime)}
          <br />
          Updated {formatClock(current.updatedAt)}
        </p>
      </div>

      <div className="now-main">
        <p className="big-temp">{formatTemp(current.tempC, current.tempF, unit)}</p>
        <div className="now-cond">
          <img src={current.icon} alt="" width="64" height="64" />
          <p className="cond-text">{current.condition}</p>
          <p className="feels">Feels like {formatTemp(current.feelsLikeC, current.feelsLikeF, unit)}</p>
        </div>
      </div>

      <dl className="now-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
