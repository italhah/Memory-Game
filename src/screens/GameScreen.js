import { useRef, useCallback } from 'react';
import { ArrowLeft, Play, Home, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import GameBoard from '../components/game/GameBoard';
import GameHud from '../components/game/GameHud';
import { useGame } from '../game/useGame';
import { DIFFICULTY_CONFIG } from '../game/difficultyConfig';
import { formatTime } from '../game/gameUtils';
import './GameScreen.css';

export default function GameScreen({ difficulty, onExit, onGameComplete }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const game = useGame(difficulty);
  const completedRef = useRef(false);

  const handleCardClick = useCallback((index) => {
    game.handleCardClick(index);
  }, [game]);

  const handleRestart = useCallback(() => {
    completedRef.current = false;
    game.startGame();
  }, [game]);

  const handlePause = useCallback(() => game.pause(), [game]);
  const handleResume = useCallback(() => game.resume(), [game]);

  if (game.status === 'won' && !completedRef.current) {
    completedRef.current = true;
    setTimeout(() => {
      onGameComplete({
        difficulty,
        score: game.score,
        moves: game.moves,
        timeSeconds: game.time,
        matchedPairs: game.matchedCount,
        totalPairs: game.totalPairs,
        completed: true,
      });
    }, 1500);
  }

  if (game.status === 'timeup' && !completedRef.current) {
    completedRef.current = true;
    setTimeout(() => {
      onGameComplete({
        difficulty,
        score: 0,
        moves: game.moves,
        timeSeconds: game.time,
        matchedPairs: game.matchedCount,
        totalPairs: game.totalPairs,
        completed: false,
      });
    }, 100);
  }

  return (
    <div className="game-screen">
      <div className="game-screen-header">
        <button className="auth-back" onClick={onExit}>
          <ArrowLeft size={16} />
          <span>Quit Game</span>
        </button>
        <div
          className="game-difficulty-badge"
          style={{
            background: `${config.color}22`,
            color: config.color,
            border: `1px solid ${config.color}44`,
          }}
        >
          {config.label}
        </div>
        <div style={{ width: 100 }} />
      </div>

      <div className="game-screen-body">
        <div className="sr-only" aria-live="polite">
          {game.status === 'playing' && `Game in progress. ${game.matchedCount} of ${game.totalPairs} pairs matched. ${game.moves} moves. ${formatTime(game.time)} elapsed.`}
          {game.status === 'won' && 'Game complete! All pairs matched.'}
          {game.status === 'paused' && 'Game paused.'}
        </div>

        <GameHud
          time={game.time}
          timeLimit={game.timeLimit}
          moves={game.moves}
          matchedPairs={game.matchedCount}
          totalPairs={game.totalPairs}
          difficulty={difficulty}
          isPaused={game.isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onRestart={handleRestart}
        />

        <GameBoard
          cards={game.cards}
          columns={config.columns}
          flippedIndices={game.flippedIndices}
          matchedCount={game.matchedCount}
          onCardClick={handleCardClick}
        />

        {game.status === 'won' && (
          <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-500)', fontFamily: 'var(--font-display)' }}>
              Score: {game.score}
            </div>
          </div>
        )}
      </div>

      {game.status === 'paused' && (
        <div className="pause-overlay" onClick={handleResume}>
          <div className="pause-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="pause-title">Paused</h2>
            <div className="pause-actions">
              <Button size="lg" onClick={handleResume}>
                <Play size={18} /> Resume
              </Button>
              <Button variant="ghost" onClick={onExit}>
                <Home size={18} /> Quit to Menu
              </Button>
            </div>
          </div>
        </div>
      )}

      {game.status === 'timeup' && (
        <div className="timeup-overlay">
          <div className="timeup-content">
            <Clock size={48} className="timeup-icon" style={{ color: 'var(--error-500)' }} />
            <h2 className="timeup-title">Time's Up!</h2>
            <p className="timeup-text">You ran out of time. Try again?</p>
            <div className="timeup-stats">
              <div className="timeup-stat">
                <span className="timeup-stat-value">{game.matchedCount}/{game.totalPairs}</span>
                <span className="timeup-stat-label">Matched</span>
              </div>
              <div className="timeup-stat">
                <span className="timeup-stat-value">{game.moves}</span>
                <span className="timeup-stat-label">Moves</span>
              </div>
            </div>
            <div className="timeup-actions">
              <Button size="lg" onClick={handleRestart}>Try Again</Button>
              <Button variant="secondary" onClick={onExit}>Main Menu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
