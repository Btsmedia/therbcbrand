export default function Stars({ value = 0, large = false, label }) {
  return <span className={`stars-s ${large ? 'lg' : ''}`} style={{ '--r': value }} aria-label={label || `Rated ${value.toFixed(1)} out of 5`} role="img" />;
}
