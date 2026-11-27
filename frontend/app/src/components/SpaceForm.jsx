import { useState } from "react";
import { RATE_FIELDS, SPACE_TYPES } from "../lib/config.js";
import { t } from "../lib/i18n/index.js";
import TextField from "./TextField.jsx";

// Create / edit form for a space. Fields match SpaceRequest; validation is left to the API (400 + errors map).
// space: the space to edit, or null for a new one. The submit button can sit outside the form (form={id}).
export default function SpaceForm({ id, space, errors, onSubmit }) {
  const [values, setValues] = useState(() => ({
    name: space?.name ?? "",
    type: space?.type ?? "",
    ...Object.fromEntries(RATE_FIELDS.map((key) => [key, space?.[key] ?? ""])),
  }));

  const change = (name) => (event) => setValues({ ...values, [name]: event.target.value });

  function submit(event) {
    event.preventDefault();
    onSubmit({
      name: values.name,
      type: values.type || null,
      ...Object.fromEntries(RATE_FIELDS.map((key) => [key, values[key] === "" ? null : Number(values[key])])),
    });
  }

  return (
    <form id={id} className="form" noValidate onSubmit={submit}>
      <TextField
        id="space-name"
        label={t("adminSpaces.name")}
        type="text"
        autoComplete="off"
        placeholder={t("adminSpaces.namePlaceholder")}
        value={values.name}
        onChange={change("name")}
        error={errors.fields.name}
      />
      <div className={errors.fields.type ? "field field--invalid" : "field"}>
        <label className="field__label" htmlFor="space-type">
          {t("adminSpaces.type")}
        </label>
        <select id="space-type" className="select" value={values.type} onChange={change("type")}>
          <option value="">{t("adminSpaces.chooseType")}</option>
          {SPACE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
        {errors.fields.type && <p className="field__error">{errors.fields.type}</p>}
      </div>
      <div className="field-row">
        {RATE_FIELDS.map((key) => (
          <TextField
            key={key}
            id={`space-${key}`}
            label={t(`rates.${key}`)}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            suffix="€"
            value={values[key]}
            onChange={change(key)}
            error={errors.fields[key]}
          />
        ))}
      </div>
    </form>
  );
}
