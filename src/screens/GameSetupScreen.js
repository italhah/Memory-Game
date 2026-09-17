import { useState } from 'react';
import { Leaf, Flame, Zap, ArrowLeft, Trophy } from 'lucide-react';
import Button from '../components/ui/Button';
import { DIFFICULTY_CONFIG, DIFFICULTY_ORDER } from '../game/difficultyConfig';
import './GameSetupScreen.css';

const ICONS = { leaf: Leaf, flame: Flame, zap: Zap };

export default function GameSetupScreen({ profile, onStart, onBack }) {
  const [selected, setSelected] = useState('easy');

  const bestScore = profile ? profile[`best_score_${selected}`] || 0 : null;

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Main Menu</span>
        </button>
        <h1>Choose Your Challenge</h1>
        <div style={{ width: 100 }} />
      </div>

      <div className="setup-content">
        <h2 className="setup-title">Select Difficulty</h2>
        <p className="setup-subtitle">Each level offers a unique challenge. Pick one to begin.</p>

        <div className="difficulty-cards">
          {DIFFICULTY_ORDER.map((key) => {
            const config = DIFFICULTY_CONFIG[key];
            const Icon = ICONS[config.icon] || Leaf;
            const isSelected = selected === key;
            return (
              <div
                key={key}
                className={`difficulty-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(key)}
                style={{
                  '--card-color': config.color,
                  '--card-color-bg': `${config.color}22`,
                  '--card-glow': `${config.color}33`,
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(key);
                  }
                }}
              >
                <div className="difficulty-icon">
                  <Icon size={28} />
                </div>
                <div className="difficulty-label">{config.label}</div>
                <div className="difficulty-desc">{config.description}</div>
                <div className="difficulty-stats">
                  <div className="difficulty-stat">
                    <span className="difficulty-stat-label">Pairs</span>
                    <span className="difficulty-stat-value">{config.pairs}</span>
                  </div>
                  <div className="difficulty-stat">
                    <span className="difficulty-stat-label">Time</span>
                    <span className="difficulty-stat-value">
                      {config.timeLimit ? `${config.timeLimit}s` : 'None'}
                    </span>
                  </div>
                  <div className="difficulty-stat">
                    <span className="difficulty-stat-label">Base</span>
                    <span className="difficulty-stat-value">{config.baseScore}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="setup-actions">
          {bestScore !== null && bestScore > 0 && (
            <div className="setup-best">
              <Trophy size={16} style={{ color: 'var(--warning-500)' }} />
              <span>Best: <span className="setup-best-value">{bestScore}</span></span>
            </div>
          )}
          <Button size="lg" onClick={() => onStart(selected)}>
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}
