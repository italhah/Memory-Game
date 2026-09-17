import './Spinner.css';

export default function Spinner({ size = 'md', text }) {
  const sizeClass = size === 'lg' ? 'spinner-lg' : size === 'sm' ? 'spinner-sm' : '';
  if (text) {
    return (
      <div className="loading-container">
        <div className={`spinner ${sizeClass}`} />
        <p className="loading-text">{text}</p>
      </div>
    );
  }
  return <div className={`spinner ${sizeClass}`} role="status" aria-label="Loading" />;
}
