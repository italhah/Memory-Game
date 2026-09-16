import Card from './Card';
import './GameBoard.css';

export default function GameBoard({ cards, columns, flippedIndices, matchedCount, onCardClick }) {
  return (
    <div className="game-board">
      <div className="game-grid" data-cols={columns}>
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || card.matched;
          return (
            <Card
              key={card.id}
              card={card}
              index={index}
              isFlipped={isFlipped}
              isMatched={card.matched}
              onClick={onCardClick}
            />
          );
        })}
      </div>
    </div>
  );
}
