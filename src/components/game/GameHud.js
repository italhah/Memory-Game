import { Clock, MousePointerClick, Target, Pause, Play, RotateCcw } from 'lucide-react';
import { formatTime } from '../../game/gameUtils';
import './GameHud.css';

export default function GameHud({
  time,
  timeLimit,
  moves,
  matchedPairs,
  totalPairs,
  difficulty,
  isPaused,
  onPause,
  onResume,
  onRestart,
}) {
  const timeRemaining = timeLimit ? Math.max(0, timeLimit - time) : null;
  const timeDisplay = timeLimit ? formatTime(timeRemaining) : formatTime(time);
  const timeClass = timeLimit
    ? timeRemaining <= 10 ? 'danger' : timeRemaining <= 30 ? 'warning' : ''
    : '';
  const progress = totalPairs > 0 ? Math.round((matchedPairs / totalPairs) * 100) : 0;

  return (
    <div className="hud" role="status" aria-live="polite">
      <div className="hud-item">
        <span className="hud-label">Time</span>
        <span className={`hud-value ${timeClass}`}>
          <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
          {timeDisplay}
        </span>
      </div>

      <div className="hud-divider" />

      <div className="hud-item">
        <span className="hud-label">Moves</span>
        <span className="hud-value">
          <MousePointerClick size={14} style={{ display: 'inline', marginRight: 4 }} />
          {moves}
        </span>
      </div>

      <div className="hud-divider" />

      <div className="hud-item">
        <span className="hud-label">Matched</span>
        <span className="hud-value success">
          <Target size={14} style={{ display: 'inline', marginRight: 4 }} />
          {matchedPairs}/{totalPairs}
        </span>
      </div>

      <div className="hud-divider" />

      <div className="hud-item">
        <span className="hud-label">Progress</span>
        <span className="hud-value">{progress}%</span>
      </div>

      <div className="hud-actions">
        {isPaused ? (
          <button className="btn btn-ghost btn-icon" onClick={onResume} aria-label="Resume game">
            <Play size={18} />
          </button>
        ) : (
          <button className="btn btn-ghost btn-icon" onClick={onPause} aria-label="Pause game">
            <Pause size={18} />
          </button>
        )}
        <button className="btn btn-ghost btn-icon" onClick={onRestart} aria-label="Restart game">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
