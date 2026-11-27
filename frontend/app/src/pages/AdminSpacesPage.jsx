import { useEffect, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Dialog from "../components/Dialog.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import Segmented from "../components/Segmented.jsx";
import ShapeIcon from "../components/ShapeIcon.jsx";
import SpaceForm from "../components/SpaceForm.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import TypeChip from "../components/TypeChip.jsx";
import { createSpace, deleteSpace, getBookings, getSpaces, updateSpace } from "../lib/api.js";
import { RATE_FIELDS, SPACE_TYPES } from "../lib/config.js";
import { formatMoney } from "../lib/dates.js";
import { formErrors, NO_ERRORS } from "../lib/forms.js";
import { t } from "../lib/i18n/index.js";
import { byTypeThenName } from "../lib/spaces.js";

// Espaces (admin): list, create, update and delete spaces with their rates.
export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState(null);
  const [bookingCounts, setBookingCounts] = useState(new Map());
  const [selectedType, setSelectedType] = useState("ALL");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null); // confirmation of the last change
  const [editing, setEditing] = useState(null); // { space } while the form dialog is open; space is null for a new one
  const [toDelete, setToDelete] = useState(null);
  const [version, setVersion] = useState(0); // bumped to load the list again

  useEffect(() => {
    getSpaces()
      .then(setSpaces)
      .catch((err) => setError(t("common.loadError", { detail: err.detail })));
    getBookings()
      .then((bookings) => {
        const counts = new Map();
        for (const booking of bookings) counts.set(booking.spaceId, (counts.get(booking.spaceId) ?? 0) + 1);
        setBookingCounts(counts);
      })
      .catch(() => setBookingCounts(new Map())); // real mode: the bookings API does not exist yet
  }, [version]);

  function saved(message) {
    setEditing(null);
    setNotice(message);
    setVersion((v) => v + 1);
  }

  async function confirmDelete() {
    const space = toDelete;
    setToDelete(null);
    setError(null);
    try {
      await deleteSpace(space.id);
      setNotice(t("adminSpaces.deleted", { name: space.name }));
      setVersion((v) => v + 1);
    } catch (err) {
      setNotice(null);
      setError(err.detail ?? String(err)); // e.g. 500 "… il a des réservations"
    }
  }

  const shown = (spaces ?? [])
    .filter((space) => selectedType === "ALL" || space.type === selectedType)
    .sort(byTypeThenName);

  return (
    <main className="inner page">
      <PageTitle title={t("pages.adminSpaces")} />
      <div className="page-head">
        <div className="page-head__text">
          <h1>{t("pages.adminSpaces")}</h1>
          <p className="lead">{t("adminSpaces.lead")}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing({ space: null })}>
          {t("adminSpaces.add")}
        </button>
      </div>
      <div className="toolbar">
        <Segmented
          name="space-type-filter"
          value={selectedType}
          options={[
            { value: "ALL", label: t("common.all") },
            ...SPACE_TYPES.map((type) => ({ value: type, label: t(`typesPlural.${type}`), icon: <ShapeIcon type={type} /> })),
          ]}
          onChange={setSelectedType}
        />
        {spaces && <p className="muted">{t("adminSpaces.count", { n: shown.length })}</p>}
      </div>
      <ErrorAlert>{error}</ErrorAlert>
      <StatusMessage>{notice}</StatusMessage>
      {spaces &&
        (shown.length === 0 ? (
          <div className="empty">
            <p>{t("adminSpaces.empty")}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table table--cards">
              <thead>
                <tr>
                  <th scope="col">{t("adminSpaces.colSpace")}</th>
                  <th scope="col">{t("adminSpaces.colType")}</th>
                  {RATE_FIELDS.map((key) => (
                    <th key={key} scope="col" className="num">
                      {t(`rates.${key}`)}
                    </th>
                  ))}
                  <th scope="col" className="num">
                    {t("adminSpaces.colBookings")}
                  </th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((space) => (
                  <tr key={space.id}>
                    <td>
                      <span className="table__name">
                        <ShapeIcon type={space.type} />
                        {space.name}
                      </span>
                    </td>
                    <td data-label={t("adminSpaces.colType")}>
                      <TypeChip type={space.type} />
                    </td>
                    {RATE_FIELDS.map((key) => (
                      <td key={key} className="num" data-label={t(`rates.${key}`)}>
                        {formatMoney(space[key])}
                      </td>
                    ))}
                    <td className="num" data-label={t("adminSpaces.colBookings")}>
                      {bookingCounts.get(space.id) ?? 0}
                    </td>
                    <td>
                      <div className="table__actions">
                        <button type="button" className="btn btn--small" onClick={() => setEditing({ space })}>
                          {t("common.edit")}
                        </button>
                        <button type="button" className="btn btn--small btn--danger" onClick={() => setToDelete(space)}>
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      {editing && <SpaceDialog space={editing.space} onSaved={saved} onClose={() => setEditing(null)} />}
      {toDelete && (
        <ConfirmDialog
          title={t("adminSpaces.deleteTitle", { name: toDelete.name })}
          message={t("adminSpaces.deleteMessage")}
          confirmLabel={t("common.delete")}
          danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </main>
  );
}

// The space form in a dialog: creates a space, or updates the one given.
function SpaceDialog({ space, onSaved, onClose }) {
  const [errors, setErrors] = useState(NO_ERRORS);
  const [saving, setSaving] = useState(false);

  async function save(values) {
    setErrors(NO_ERRORS);
    setSaving(true);
    try {
      const result = space ? await updateSpace(space.id, values) : await createSpace(values);
      onSaved(t(space ? "adminSpaces.updated" : "adminSpaces.created", { name: result.name }));
    } catch (err) {
      setErrors(formErrors(err));
      setSaving(false);
    }
  }

  return (
    <Dialog
      title={t(space ? "adminSpaces.editTitle" : "adminSpaces.newTitle")}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button type="submit" form="space-form" className="btn btn--primary" disabled={saving}>
            {t("common.save")}
          </button>
        </>
      }
    >
      <ErrorAlert>{errors.alert}</ErrorAlert>
      <SpaceForm id="space-form" space={space} errors={errors} onSubmit={save} />
    </Dialog>
  );
}
