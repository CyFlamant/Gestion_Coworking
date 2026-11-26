// Each space type has a shape and a colour: open space = circle, office = square, meeting room = star.
const SHAPES = {
  OPENSPACE: <circle cx="12" cy="12" r="11" />,
  OFFICE: <rect x="1" y="1" width="22" height="22" />,
  ROOM: (
    <path d="M12 .8l3.1 7.6 8.2.6-6.3 5.3 2 8-7-4.4-7 4.4 2-8L.7 9l8.2-.6z" />
  ),
};

export default function ShapeIcon({ type }) {
  return (
    <span className={`shape shape--${type.toLowerCase()}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {SHAPES[type]}
      </svg>
    </span>
  );
}
