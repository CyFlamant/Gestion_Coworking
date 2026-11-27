import { formatMoney, formatShortDate, formatTime, parseLocal, startOfDay } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import ShapeIcon from "./ShapeIcon.jsx";

// Admin bookings as a table (cards on phones), with a checkbox to include the past ones.
export default function AdminBookingList({ bookings, showPast, onShowPast, onEdit, onDelete }) {
  return (
    <div className="form">
      <label className="field__hint">
        <input type="checkbox" checked={showPast} onChange={(event) => onShowPast(event.target.checked)} />{" "}
        {t("adminBookings.showPast")}
      </label>
      {bookings.length === 0 ? (
        <p className="empty">{t("adminBookings.empty")}</p>
      ) : (
        <div className="table-wrap">
          <table className="table table--cards">
            <thead>
              <tr>
                {["colDate", "colTime", "colSpace", "colClient", "colFormula"].map((key) => (
                  <th key={key} scope="col">
                    {t(`adminBookings.${key}`)}
                  </th>
                ))}
                <th scope="col" className="num">
                  {t("adminBookings.colPrice")}
                </th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const start = parseLocal(booking.startDateTime);
                const end = parseLocal(booking.endDateTime);
                const multiDay = startOfDay(start).getTime() !== startOfDay(end).getTime();
                return (
                  <tr key={booking.id}>
                    <td data-label={t("adminBookings.colDate")}>
                      {multiDay ? `${formatShortDate(start)} → ${formatShortDate(end)}` : formatShortDate(start)}
                    </td>
                    <td data-label={t("adminBookings.colTime")}>{`${formatTime(start)} – ${formatTime(end)}`}</td>
                    <td data-label={t("adminBookings.colSpace")}>
                      <span className="table__name">
                        <ShapeIcon type={booking.spaceType} />
                        {booking.spaceName}
                      </span>
                    </td>
                    <td data-label={t("adminBookings.colClient")}>{booking.userName}</td>
                    <td data-label={t("adminBookings.colFormula")}>{t(`formulas.${booking.formula}`)}</td>
                    <td className="num" data-label={t("adminBookings.colPrice")}>
                      {booking.price != null ? formatMoney(booking.price) : "—"}
                    </td>
                    <td>
                      <div className="table__actions">
                        <button type="button" className="btn btn--small" onClick={() => onEdit(booking)}>
                          {t("common.edit")}
                        </button>
                        <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(booking)}>
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
