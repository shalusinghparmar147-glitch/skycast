import { useEffect, useState } from 'react';
import { searchCities } from '../api.js';
import { useDebounce } from '../hooks/useDebounce.js';

export default function SearchBar({ onSearch, onLocate }) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const query = useDebounce(text.trim(), 300);
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    searchCities(query, controller.signal)
      .then(setSuggestions)
      .catch((err) => {
        if (err.name !== 'AbortError') setSuggestions([]); 
      });
    return () => controller.abort(); 
  }, [query]);

  function choose(q) {
    onSearch(q);
    setText('');
    setOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (text.trim().length >= 2) choose(text.trim());
  }

  const showList = open && text.trim().length >= 2 && suggestions.length > 0;

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <div className="search-field">
        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          type="search"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Search for a city"
          aria-label="City name"
          autoComplete="off"
        />
        {showList && (
          <ul className="suggestions">
            {suggestions.map((city) => (
              <li key={city.id ?? `${city.lat},${city.lon}`}>
                <button
                  type="button"
                  
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(`${city.lat},${city.lon}`)}
                >
                  <strong>{city.name}</strong>
                  <span>{[city.region, city.country].filter(Boolean).join(', ')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        Search
      </button>
      <button type="button" className="btn btn-quiet" onClick={onLocate}>
        <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
        Use my location
      </button>
    </form>
  );
}
