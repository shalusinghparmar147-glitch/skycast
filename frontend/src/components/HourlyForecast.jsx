import { formatHour, formatTemp } from '../utils/format.js';

export default function HourlyForecast({ hours, unit }) {
  return (
    <section className="section" aria-labelledby="hours-title">
      <h3 id="hours-title" className="section-title">
        Next 24 hours
      </h3>
      <ol className="hour-strip">
        {hours.map((hour, index) => (
          <li key={hour.time} className={index === 0 ? 'is-now' : undefined}>
            <span className="h-time">{index === 0 ? 'Now' : formatHour(hour.time)}</span>
            <img src={hour.icon} alt={hour.condition} title={hour.condition} width="44" height="44" />
            <span className="h-temp">{formatTemp(hour.tempC, hour.tempF, unit)}</span>
            <span className="h-rain">
              {hour.chanceOfRain > 0 && (
                <>
                  <span className="visually-hidden">Chance of rain </span>
                  {hour.chanceOfRain}%
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
