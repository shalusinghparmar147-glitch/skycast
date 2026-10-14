import { formatTemp, formatWeekday } from '../utils/format.js';

export default function DailyForecast({ days, unit }) {
  // One shared scale for all days, so the bars can be compared with each other
  const lowest = Math.min(...days.map((day) => day.minC));
  const highest = Math.max(...days.map((day) => day.maxC));
  const span = highest - lowest || 1;
  const position = (celsius) => `${((celsius - lowest) / span) * 100}%`;

  return (
    <section className="section" aria-labelledby="days-title">
      <h3 id="days-title" className="section-title">
        {days.length}-day forecast
      </h3>
      <ul className="day-list">
        {days.map((day, index) => (
          <li key={day.date}>
            <span className="d-name">{index === 0 ? 'Today' : formatWeekday(day.date)}</span>
            <img src={day.icon} alt={day.condition} width="44" height="44" />
            <span className="d-cond">{day.condition}</span>
            <span className="d-rain">
              {day.chanceOfRain > 0 && (
                <>
                  <span className="visually-hidden">Chance of rain </span>
                  {day.chanceOfRain}%
                </>
              )}
            </span>
            <span className="d-min">
              <span className="visually-hidden">Low </span>
              {formatTemp(day.minC, day.minF, unit)}
            </span>
            {/* The bar shows where today's low-to-high sits between the coolest and warmest of all days */}
            <span className="range" style={{ '--from': position(day.minC), '--to': position(day.maxC) }} aria-hidden="true" />
            <span className="d-max">
              <span className="visually-hidden">High </span>
              {formatTemp(day.maxC, day.maxF, unit)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
