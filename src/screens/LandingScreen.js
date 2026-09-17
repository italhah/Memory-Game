import { BrainCircuit, Clock, Trophy, BarChart3, Layers, Keyboard } from 'lucide-react';
import Button from '../components/ui/Button';
import './LandingScreen.css';

export default function LandingScreen({ onStart, onSignIn }) {
  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-badge">
          <BrainCircuit size={14} />
          <span>Memory Game</span>
        </div>

        <h1 className="landing-title">Match the Cards, Train Your Mind</h1>
        <p className="landing-subtitle">
          Flip cards, find pairs, and beat the clock. Choose your difficulty,
          climb the leaderboard, and challenge your memory.
        </p>

        <div className="landing-features">
          <div className="landing-feature">
            <Layers size={16} className="landing-feature-icon" />
            <span>3 Difficulty Levels</span>
          </div>
          <div className="landing-feature">
            <Clock size={16} className="landing-feature-icon" />
            <span>Timed Challenges</span>
          </div>
          <div className="landing-feature">
            <Trophy size={16} className="landing-feature-icon" />
            <span>Leaderboard</span>
          </div>
          <div className="landing-feature">
            <BarChart3 size={16} className="landing-feature-icon" />
            <span>Track Your Stats</span>
          </div>
          <div className="landing-feature">
            <Keyboard size={16} className="landing-feature-icon" />
            <span>Keyboard Accessible</span>
          </div>
        </div>

        <div className="landing-actions">
          <Button size="lg" onClick={onStart}>
            Play as Guest
          </Button>
          <Button variant="ghost" onClick={onSignIn}>
            Sign In to Save Scores
          </Button>
        </div>
      </div>

      <div className="landing-footer">
        Originally developed by Talha Rahman
      </div>
    </div>
  );
}
