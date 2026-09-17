import { BrainCircuit } from 'lucide-react';
import './Card.css';

export default function Card({ card, isFlipped, isMatched, isMismatched, onClick, index }) {
  const classes = [
    'card',
    isFlipped ? 'flipped' : '',
    isMatched ? 'matched' : '',
    isMismatched ? 'mismatched' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={() => onClick(index)}
      role="button"
      tabIndex={isMatched ? -1 : 0}
      aria-label={isFlipped || isMatched ? `Card showing ${card.name}` : 'Face-down card'}
      aria-pressed={isFlipped || isMatched}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(index);
        }
      }}
    >
      <div className="card-inner">
        <div className="card-face card-back">
          <BrainCircuit size={32} className="card-back-icon" />
        </div>
        <div className="card-face card-front">
          <img src={card.src} alt={card.name} draggable="false" />
        </div>
      </div>
    </div>
  );
}
