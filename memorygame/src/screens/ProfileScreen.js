import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trophy, Gamepad2, Clock, Target, LogOut, BarChart3, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { DIFFICULTY_CONFIG, DIFFICULTY_ORDER } from '../game/difficultyConfig';
import { formatTime } from '../game/gameUtils';
import { fetchGameHistory } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import './ProfileScreen.css';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ProfileScreen({ onBack, onLeaderboard }) {
  const { user, profile, signOut } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchGameHistory(user.id, 10);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (!profile) {
    return (
      <div className="profile-screen">
        <div className="lb-empty">
          <Spinner size="lg" text="Loading profile..." />
        </div>
      </div>
    );
  }

  const avgTime = profile.games_played > 0
    ? Math.round(profile.total_time_seconds / profile.games_played)
    : 0;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1>Profile</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div
            className="profile-avatar"
            style={{ background: profile.avatar_color || '#3b82f6' }}
          >
            {getInitials(profile.display_name)}
          </div>
          <div className="profile-info">
            <div className="profile-name">{profile.display_name}</div>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Gamepad2 size={20} />
            </div>
            <div className="profile-stat-value">{profile.games_played}</div>
            <div className="profile-stat-label">Games Played</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Clock size={20} />
            </div>
            <div className="profile-stat-value">{formatTime(avgTime)}</div>
            <div className="profile-stat-label">Avg Time</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Target size={20} />
            </div>
            <div className="profile-stat-value">{profile.total_moves}</div>
            <div className="profile-stat-label">Total Moves</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Trophy size={20} />
            </div>
            <div className="profile-stat-value">
              {DIFFICULTY_ORDER.reduce((sum, d) => sum + (profile[`best_score_${d}`] || 0), 0)}
            </div>
            <div className="profile-stat-label">Total Best</div>
          </div>
        </div>

        <div className="profile-best-scores">
          <div className="profile-best-title">
            <Trophy size={18} />
            Best Scores
          </div>
          {DIFFICULTY_ORDER.map((key) => {
            const config = DIFFICULTY_CONFIG[key];
            const score = profile[`best_score_${key}`] || 0;
            return (
              <div key={key} className="profile-best-row">
                <span className="profile-best-label">
                  <span className="profile-best-dot" style={{ background: config.color }} />
                  {config.label}
                </span>
                <span className="profile-best-value">{score}</span>
              </div>
            );
          })}
        </div>

        <div className="profile-history">
          <div className="profile-best-title">
            <Activity size={18} />
            Recent Games
          </div>
          {loading ? (
            <Spinner size="sm" text="Loading..." />
          ) : history.length === 0 ? (
            <div className="lb-empty-text" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
              No games played yet. Start a game to see your history here!
            </div>
          ) : (
            history.map((game) => {
              const config = DIFFICULTY_CONFIG[game.difficulty];
              return (
                <div key={game.id} className="history-row">
                  <span
                    className="history-difficulty"
                    style={{ background: `${config.color}22`, color: config.color }}
                  >
                    {config.label}
                  </span>
                  <span className="history-score">{game.score}</span>
                  <span style={{ color: 'var(--neutral-400)' }}>{game.moves} moves</span>
                  <span className="history-time">{timeAgo(game.created_at)}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="profile-actions">
          <Button variant="secondary" block onClick={onLeaderboard}>
            <BarChart3 size={18} /> Leaderboard
          </Button>
          <Button variant="danger" block onClick={signOut}>
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
