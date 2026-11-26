// Labelled input with an optional hint and an error message. The other props (type, value, onChange…) go to the <input>.
export default function TextField({ id, label, hint, error, ...inputProps }) {
  const errorId = `${id}-error`;
  return (
    <div className={error ? "field field--invalid" : "field"}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {hint && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
