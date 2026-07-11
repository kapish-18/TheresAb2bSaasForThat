export default function SatireToggle({ checked, onChange }) {
  return (
    <div className="toggle-wrap">
      <span className="toggle-label">include satire</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider" />
      </label>
    </div>
  );
}
