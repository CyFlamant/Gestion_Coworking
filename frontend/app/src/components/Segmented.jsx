// A row of pill-shaped radio buttons: one choice among a few options.
export default function Segmented({ name, value, options, onChange }) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <label key={option.value} className="segmented__option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          <span>
            {option.icon}
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
