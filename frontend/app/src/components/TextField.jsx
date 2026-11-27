// Labelled input with an optional hint, unit suffix (e.g. "€") and error message.
// The other props (type, value, onChange…) go to the <input>.
export default function TextField({ id, label, hint, suffix, error, ...inputProps }) {
  const errorId = `${id}-error`;
  const input = (
    <input
      id={id}
      className="input"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
      {...inputProps}
    />
  );
  return (
    <div className={error ? "field field--invalid" : "field"}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {suffix ? (
        <div className="input-suffix">
          {input}
          <span className="input-suffix__text" aria-hidden="true">
            {suffix}
          </span>
        </div>
      ) : (
        input
      )}
      {hint && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
