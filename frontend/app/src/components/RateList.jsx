import { RATE_FIELDS } from "../lib/config.js";
import { formatMoney } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import { rateKey } from "../lib/pricing.js";

// The four rates of a space; the one used by `formula` (the formula of the chosen slot) is highlighted.
export default function RateList({ space, formula }) {
  return (
    <dl className="rate-list">
      {RATE_FIELDS.map((key) => {
        const active = key === rateKey(formula) ? "is-active" : undefined;
        return [
          <dt key={`${key}-label`} className={active}>
            {t(`rates.${key}`)}
          </dt>,
          <dd key={`${key}-value`} className={active}>
            {formatMoney(space[key])}
          </dd>,
        ];
      })}
    </dl>
  );
}
