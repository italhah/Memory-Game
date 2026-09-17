import { useState, useEffect } from 'react';
import { Trophy, Star, Clock, MousePointerClick, Target, Home, RotateCcw, BarChart3 } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { DIFFICULTY_CONFIG } from '../game/difficultyConfig';
import { formatTime, getPerformanceRating } from '../game/gameUtils';
import { saveGameResult, updateBestScore, incrementProfileStats } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import './ResultsScreen.css';

export default function ResultsScreen({ result, onPlayAgain, onMainMenu, onViewLeaderboard }) {
  const { user, profile, updateLocalProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isNewBest, setIsNewBest] = useState(false);
  const [saved, setSaved] = useState(false);

  const config = DIFFICULTY_CONFIG[result.difficulty];
  const rating = getPerformanceRating(result.score, result.difficulty);
  const won = result.completed;

  useEffect(() => {
    if (saved || !user || !won) return;
    setSaving(true);
    setSaveError('');

    (async () => {
      try {
        await saveGameResult({
          userId: user.id,
          difficulty: result.difficulty,
          score: result.score,
          moves: result.moves,
          timeSeconds: result.timeSeconds,
          matchedPairs: result.matchedPairs,
          totalPairs: result.totalPairs,
          completed: result.completed,
        });

        const bestCol = `best_score_${result.difficulty}`;
        const previousBest = profile?.[bestCol] || 0;
        if (result.score > previousBest) {
          setIsNewBest(true);
          updateLocalProfile({ [bestCol]: result.score });
        }

        await updateBestScore(user.id, result.difficulty, result.score);
        await incrementProfileStats(user.id, result.moves, result.timeSeconds);

        setSaved(true);
      } catch (err) {
        console.error('Failed to save game result:', err);
        setSaveError('Could not save your score. Your progress was not recorded.');
      } finally {
        setSaving(false);
      }
    })();
  }, [user, won, result, profile, updateLocalProfile, saved]);

  const previousBest = profile?.[`best_score_${result.difficulty}`] || 0;

  return (
    <div className="results-screen">
      <div className={`results-card ${won ? '' : 'lose'}`}>
        <div className={`results-icon ${won ? '' : 'lose'}`}>
          {won ? <Trophy size={40} color="white" /> : <Clock size={40} color="white" />}
        </div>

        <h1 className="results-title">{won ? 'You Won!' : 'Time\'s Up!'}</h1>
        <p className="results-subtitle">
          {won ? rating.label : 'Better luck next time'} · {config.label}
        </p>

        {won && (
          <div className="results-stars">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                size={32}
                className={`result-star ${i < rating.stars ? 'filled' : 'empty'}`}
                fill={i < rating.stars ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        )}

        {won && (
          <>
            <div className="results-score">{result.score}</div>
            <div className="results-score-label">Final Score</div>
          </>
        )}

        <div className="results-stats">
          <div className="result-stat">
            <Clock size={18} className="result-stat-icon" />
            <span className="result-stat-value">{formatTime(result.timeSeconds)}</span>
            <span className="result-stat-label">Time</span>
          </div>
          <div className="result-stat">
            <MousePointerClick size={18} className="result-stat-icon" />
            <span className="result-stat-value">{result.moves}</span>
            <span className="result-stat-label">Moves</span>
          </div>
          <div className="result-stat">
            <Target size={18} className="result-stat-icon" />
            <span className="result-stat-value">{result.matchedPairs}/{result.totalPairs}</span>
            <span className="result-stat-label">Matched</span>
          </div>
        </div>

        {won && user && (
          <div className={`results-best ${isNewBest ? 'new' : 'not-new'}`}>
            <Trophy size={16} />
            {saving ? (
              <span>Saving... <Spinner size="sm" /></span>
            ) : isNewBest ? (
              <span>New Best Score!</span>
            ) : (
              <span>Best: {Math.max(previousBest, result.score)}</span>
            )}
          </div>
        )}

        {won && !user && (
          <Alert variant="info" style={{ marginBottom: 'var(--spacing-lg)' }}>
            Sign in to save your scores and compete on the leaderboard.
          </Alert>
        )}

        {saveError && <Alert variant="error" style={{ marginBottom: 'var(--spacing-md)' }}>{saveError}</Alert>}

        <div className="results-actions">
          <div className="results-actions-row">
            <Button block onClick={onPlayAgain}>
              <RotateCcw size={18} /> Play Again
            </Button>
            <Button variant="secondary" block onClick={onMainMenu}>
              <Home size={18} /> Main Menu
            </Button>
          </div>
          {user && (
            <Button variant="ghost" block onClick={onViewLeaderboard}>
              <BarChart3 size={18} /> View Leaderboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
