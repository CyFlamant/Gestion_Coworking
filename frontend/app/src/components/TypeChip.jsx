import { t } from "../lib/i18n/index.js";
import ShapeIcon from "./ShapeIcon.jsx";

// Small label with the type's shape and name, e.g. "● Open space".
export default function TypeChip({ type }) {
  return (
    <span className="chip">
      <ShapeIcon type={type} />
      {t(`types.${type}`)}
    </span>
  );
}
