import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useOutletContext } from "react-router";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import RateList from "../components/RateList.jsx";
import Segmented from "../components/Segmented.jsx";
import ShapeIcon from "../components/ShapeIcon.jsx";
import SlotFields from "../components/SlotFields.jsx";
import TypeChip from "../components/TypeChip.jsx";
import { useFreeSpaces } from "../hooks/useFreeSpaces.js";
import { getSpaces } from "../lib/api.js";
import { roleOf } from "../lib/auth.js";
import { SPACE_TYPES } from "../lib/config.js";
import { addDays, formatMoney, toLocalIso, today } from "../lib/dates.js";
import { saveDraft } from "../lib/draft.js";
import { t } from "../lib/i18n/index.js";
import { bookingRange, computePrice, fitToOpeningHours } from "../lib/pricing.js";
import { describeRange } from "../lib/slots.js";

// Espaces disponibles: catalogue with rates + availability search (guests and clients).
export default function SpacesPage() {
  const user = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  // The type filter lives in the URL (#office…), so the home page panels can preselect it.
  const selectedType =
    SPACE_TYPES.find((type) => location.hash === `#${type.toLowerCase()}`) ??
    "ALL";

  const [values, setValues] = useState(() =>
    fitToOpeningHours({
      formula: "DAY",
      date: addDays(today(), 1),
      startHour: 9,
      hours: 2,
      halfDay: "MORNING",
    }),
  );
  const [spaces, setSpaces] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const range = bookingRange(values);
  const { free, searchError } = useFreeSpaces(toLocalIso(range.start), toLocalIso(range.end));

  useEffect(() => {
    getSpaces()
      .then(setSpaces)
      .catch((err) =>
        setLoadError(t("common.loadError", { detail: err.detail })),
      );
  }, []);

  // When the search failed, every space is shown as free and the message is shown above.
  const isFree = (space) => (searchError ? true : free.has(space.id));
  const ready = spaces && (free || searchError);
  const shown = ready
    ? spaces.filter(
        (space) => selectedType === "ALL" || space.type === selectedType,
      )
    : [];

  function chooseType(type) {
    navigate(
      { hash: type === "ALL" ? "" : `#${type.toLowerCase()}` },
      { replace: true },
    );
  }

  function book(space) {
    saveDraft({ spaceId: space.id, type: space.type, ...values });
    navigate("/reserver");
  }

  return (
    <main className="inner page">
      <PageTitle title={t("pages.spaces")} />
      <div className="page-head">
        <div className="page-head__text">
          <h1>{t("pages.spaces")}</h1>
          <p className="lead">{t("spaces.lead")}</p>
        </div>
      </div>
      <div className="card form">
        <fieldset className="field">
          <legend className="field__label">{t("spaces.filterType")}</legend>
          <Segmented
            name="type-filter"
            value={selectedType}
            options={[
              { value: "ALL", label: t("common.all") },
              ...SPACE_TYPES.map((type) => ({
                value: type,
                label: t(`typesPlural.${type}`),
                icon: <ShapeIcon type={type} />,
              })),
            ]}
            onChange={chooseType}
          />
        </fieldset>
        <SlotFields
          idPrefix="search"
          values={values}
          minDate={today()}
          onChange={setValues}
        />
      </div>
      <ErrorAlert>{loadError}</ErrorAlert>
      {searchError && <p className="alert alert--info">{searchError}</p>}
      {ready && (
        <>
          <p className="muted">
            {t("spaces.resultsFor", { slot: describeRange(range) })} ·{" "}
            {t("spaces.resultsCount", {
              available: shown.filter(isFree).length,
              total: shown.length,
            })}
          </p>
          <div className="space-grid" aria-live="polite">
            {shown.length === 0 && <p className="empty">{t("spaces.none")}</p>}
            {shown.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                range={range}
                isFree={isFree(space)}
                role={roleOf(user)}
                onBook={() => book(space)}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

// One space: its rates (the one used for the slot is highlighted), whether it's free, the price and the action.
function SpaceCard({ space, range, isFree, role, onBook }) {
  const price = computePrice(space, range.start, range.end);
  return (
    <article className="card space-card">
      <div className="space-card__head">
        <h2 className="space-card__name">
          <ShapeIcon type={space.type} />
          {space.name}
        </h2>
        <TypeChip type={space.type} />
      </div>
      <RateList space={space} formula={price.formula} />
      {isFree ? (
        <span className="status status--ok">{t("spaces.available")}</span>
      ) : (
        <span className="status status--busy">{t("spaces.busy")}</span>
      )}
      <div className="space-card__foot">
        <div>
          <p className="field__hint">{t("spaces.priceForSlot")}</p>
          <p className="space-card__price">{formatMoney(price.total)}</p>
        </div>
        {isFree && role === "CLIENT" && (
          <button
            type="button"
            className="btn btn--primary btn--small"
            onClick={onBook}
          >
            {t("spaces.book")}
          </button>
        )}
        {isFree && role !== "CLIENT" && (
          <Link className="btn btn--small" to="/connexion">
            {t("spaces.signInToBook")}
          </Link>
        )}
      </div>
    </article>
  );
}
