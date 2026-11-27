// Confirmation of a change (e.g. "Réservation ajoutée."); nothing when there is no message.
// role="status" lets screen readers announce it politely, when they are idle.
export default function StatusMessage({ children }) {
  if (!children) return null;
  return (
    <p className="alert alert--info" role="status">
      {children}
    </p>
  );
}
