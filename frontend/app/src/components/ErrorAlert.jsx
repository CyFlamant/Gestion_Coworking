// Error message for a whole page or form; nothing when there is no message.
// role="alert" makes screen readers announce it as soon as it appears.
export default function ErrorAlert({ children }) {
  if (!children) return null;
  return (
    <p className="alert alert--error" role="alert">
      {children}
    </p>
  );
}
