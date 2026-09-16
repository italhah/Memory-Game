import { useState } from 'react';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { AVATAR_COLORS } from '../game/difficultyConfig';
import './AuthScreen.css';

export default function AuthScreen({ initialMode = 'signin', onBack, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }

    setLoading(true);
    try {
      if (onAuthSuccess) {
        await onAuthSuccess({ mode, email, password, displayName: displayName.trim(), avatarColor });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>

        <div className="auth-header">
          <BrainCircuit size={40} style={{ color: 'var(--primary-400)', marginBottom: 12 }} />
          <h1>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{mode === 'signup' ? 'Sign up to save scores and climb the leaderboard' : 'Sign in to continue your journey'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Input
              label="Display Name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Avatar Color</label>
              <div className="auth-color-picker">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${avatarColor === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setAvatarColor(color)}
                    aria-label={`Choose color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <Alert variant="error">{error}</Alert>}

          <Button type="submit" block disabled={loading}>
            {loading ? <Spinner size="sm" /> : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <div className="auth-footer">
          {mode === 'signup' ? (
            <>Already have an account? <button onClick={() => { setMode('signin'); setError(''); }}>Sign in</button></>
          ) : (
            <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }}>Sign up</button></>
          )}
        </div>
      </div>
    </div>
  );
}
