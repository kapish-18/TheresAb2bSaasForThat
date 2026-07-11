import { useState } from 'react';

export default function DiceButton({ onRoll }) {
  const [rolling, setRolling] = useState(false);

  function handleClick() {
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
      onRoll();
    }, 350);
  }

  return (
    <button
      className={`dice-btn${rolling ? ' rolling' : ''}`}
      onClick={handleClick}
      aria-label="Roll a random problem"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8" cy="8" r="1.2" fill="currentColor" />
        <circle cx="16" cy="8" r="1.2" fill="currentColor" />
        <circle cx="8" cy="16" r="1.2" fill="currentColor" />
        <circle cx="16" cy="16" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
    </button>
  );
}
