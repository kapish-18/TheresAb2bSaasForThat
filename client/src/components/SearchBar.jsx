import { useState } from 'react';
import DiceButton from './DiceButton';

export default function SearchBar({ onSearch, onRoll, value, onChange }) {
  const [localValue, setLocalValue] = useState(value || '');

  function handleChange(e) {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSearch(localValue);
  }

  return (
    <div className="search-row">
      <div className="search-box">
        <input
          type="text"
          placeholder="try: coffee machine, fish in microwave, zoom background..."
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <span className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
      </div>
      <DiceButton onRoll={onRoll} />
    </div>
  );
}
