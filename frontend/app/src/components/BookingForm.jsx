import { SPACE_TYPES } from "../lib/config.js";
import { t } from "../lib/i18n/index.js";
import Segmented from "./Segmented.jsx";
import ShapeIcon from "./ShapeIcon.jsx";
import SlotFields from "./SlotFields.jsx";

// Space type + slot + space. Used by "Réserver" (and later the admin booking dialog).
// Controlled: the parent keeps `booking` ({ type, slot }) and the chosen `spaceId`, and gets changes in onChange.
// free: ids of the spaces free on the slot, or null when unknown (every space is then offered as free).
export default function BookingForm({
  idPrefix,
  spaces,
  booking,
  spaceId,
  free,
  minDate,
  onChange,
}) {
  const ofType = spaces.filter((space) => space.type === booking.type);
  const isFree = (space) => !free || free.has(space.id);
  const noneFree = ofType.length > 0 && !ofType.some(isFree);
  const chosen = ofType.find((space) => space.id === spaceId);

  return (
    <div className="form">
      <fieldset className="field">
        <legend className="field__label">{t("booking.type")}</legend>
        <Segmented
          name={`${idPrefix}-type`}
          value={booking.type}
          options={SPACE_TYPES.map((type) => ({
            value: type,
            label: t(`types.${type}`),
            icon: <ShapeIcon type={type} />,
          }))}
          onChange={(type) => onChange({ type })}
        />
      </fieldset>
      <SlotFields
        idPrefix={idPrefix}
        values={booking.slot}
        minDate={minDate}
        onChange={(slot) => onChange({ slot })}
      />
      <div
        className={
          chosen && !isFree(chosen) && !noneFree
            ? "field field--invalid"
            : "field"
        }
      >
        <label className="field__label" htmlFor={`${idPrefix}-space`}>
          {t("booking.space")}
        </label>
        {noneFree ? (
          <p className="muted">{t("booking.noneFree")}</p>
        ) : (
          <select
            id={`${idPrefix}-space`}
            className="select"
            value={spaceId ?? ""}
            disabled={ofType.length === 0}
            onChange={(event) =>
              onChange({ spaceId: Number(event.target.value) })
            }
          >
            {ofType.length === 0 && (
              <option value="">{t("booking.noSpace")}</option>
            )}
            {ofType.map((space) => (
              <option key={space.id} value={space.id}>
                {isFree(space)
                  ? space.name
                  : t("booking.optionBusy", { name: space.name })}
              </option>
            ))}
          </select>
        )}
        {chosen && !isFree(chosen) && !noneFree && (
          <p className="field__error">{t("booking.spaceBusy")}</p>
        )}
      </div>
    </div>
  );
}
