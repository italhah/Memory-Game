import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trophy, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { DIFFICULTY_CONFIG, DIFFICULTY_ORDER } from '../game/difficultyConfig';
import { fetchLeaderboard, fetchRecentGames } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import './LeaderboardScreen.css';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getRankClass(rank) {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return '';
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

export default function LeaderboardScreen({ onBack }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('easy');
  const [leaders, setLeaders] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [leaderData, recentData] = await Promise.all([
        fetchLeaderboard(tab, 10),
        fetchRecentGames(5),
      ]);
      setLeaders(leaderData);
      setRecent(recentData);
    } catch (err) {
      console.error('Leaderboard load failed:', err);
      setError('Could not load leaderboard data.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="leaderboard-screen">
      <div className="leaderboard-header">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1>Leaderboard</h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-tabs">
          {DIFFICULTY_ORDER.map((key) => (
            <button
              key={key}
              className={`leaderboard-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {DIFFICULTY_CONFIG[key].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="lb-empty">
            <Spinner size="lg" text="Loading leaderboard..." />
          </div>
        ) : error ? (
          <div className="lb-empty">
            <div className="lb-empty-text">{error}</div>
            <Button variant="secondary" size="sm" onClick={load} style={{ marginTop: 'var(--spacing-md)' }}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {leaders.length === 0 ? (
              <div className="lb-empty">
                <Trophy size={48} className="lb-empty-icon" />
                <div className="lb-empty-title">No Scores Yet</div>
                <div className="lb-empty-text">Be the first to set a record on {DIFFICULTY_CONFIG[tab].label}!</div>
              </div>
            ) : (
              <div className="leaderboard-list">
                {leaders.map((entry, index) => {
                  const score = entry[`best_score_${tab}`];
                  const isCurrentUser = user && entry.id === user.id;
                  return (
                    <div
                      key={entry.id}
                      className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
                    >
                      <div className={`lb-rank ${getRankClass(index + 1)}`}>
                        {index + 1}
                      </div>
                      <div
                        className="lb-avatar"
                        style={{ background: entry.avatar_color || '#3b82f6' }}
                      >
                        {getInitials(entry.display_name)}
                      </div>
                      <span className="lb-name">
                        {entry.display_name}
                        {isCurrentUser && ' (You)'}
                      </span>
                      <span className="lb-score">
                        <Trophy size={16} />
                        {score}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {recent.length > 0 && (
              <>
                <div className="lb-section-title">
                  <Activity size={18} />
                  Recent Games
                </div>
                <div className="leaderboard-list">
                  {recent.map((game) => {
                    const profile = game.profiles;
                    const diffConfig = DIFFICULTY_CONFIG[game.difficulty];
                    return (
                      <div key={game.id} className="recent-game">
                        <div
                          className="recent-game-avatar"
                          style={{ background: profile?.avatar_color || '#3b82f6' }}
                        >
                          {getInitials(profile?.display_name)}
                        </div>
                        <span className="recent-game-name">
                          {profile?.display_name || 'Unknown'}
                        </span>
                        <span
                          className="recent-game-difficulty"
                          style={{
                            background: `${diffConfig.color}22`,
                            color: diffConfig.color,
                          }}
                        >
                          {diffConfig.label}
                        </span>
                        <span className="recent-game-score">{game.score}</span>
                        <span style={{ color: 'var(--neutral-500)', fontSize: '0.75rem' }}>
                          {timeAgo(game.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
