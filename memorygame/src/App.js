import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LandingScreen from './screens/LandingScreen';
import AuthScreen from './screens/AuthScreen';
import GameSetupScreen from './screens/GameSetupScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import Spinner from './components/ui/Spinner';
import './App.css';

function AppContent() {
  const { user, profile, loading, signUp, signIn } = useAuth();
  const [screen, setScreen] = useState('landing');
  const [difficulty, setDifficulty] = useState('easy');
  const [lastResult, setLastResult] = useState(null);
  const [authMode, setAuthMode] = useState('signin');

  const handleStartGuest = useCallback(() => {
    setDifficulty('easy');
    setScreen('setup');
  }, []);

  const handleStartSignedIn = useCallback(() => {
    setScreen('setup');
  }, []);

  const handleSignIn = useCallback(() => {
    setAuthMode('signin');
    setScreen('auth');
  }, []);

  const handleAuthSubmit = useCallback(async ({ mode, email, password, displayName, avatarColor }) => {
    if (mode === 'signup') {
      await signUp(email, password, displayName, avatarColor);
    } else {
      await signIn(email, password);
    }
    setScreen('setup');
  }, [signUp, signIn]);

  const handleDifficultySelected = useCallback((diff) => {
    setDifficulty(diff);
    setScreen('game');
  }, []);

  const handleGameComplete = useCallback((result) => {
    setLastResult(result);
    setScreen('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setScreen('game');
  }, []);

  const handleMainMenu = useCallback(() => {
    setScreen(user ? 'menu' : 'landing');
  }, [user]);

  const handleViewLeaderboard = useCallback(() => {
    setScreen('leaderboard');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setScreen(user ? 'menu' : 'landing');
  }, [user]);

  const handleViewProfile = useCallback(() => {
    setScreen('profile');
  }, []);

  const handleViewLeaderboardFromMenu = useCallback(() => {
    setScreen('leaderboard');
  }, []);

  if (loading && screen === 'landing') {
    return (
      <div className="app-loading">
        <Spinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (screen === 'landing') {
    return (
      <LandingScreen
        onStart={user ? handleStartSignedIn : handleStartGuest}
        onSignIn={user ? handleViewProfile : handleSignIn}
      />
    );
  }

  if (screen === 'auth') {
    return (
      <AuthScreen
        initialMode={authMode}
        onBack={() => setScreen('landing')}
        onAuthSuccess={handleAuthSubmit}
      />
    );
  }

  if (screen === 'menu' && user) {
    return (
      <GameSetupScreen
        profile={profile}
        onStart={handleDifficultySelected}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'setup') {
    return (
      <GameSetupScreen
        profile={profile}
        onStart={handleDifficultySelected}
        onBack={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'game') {
    return (
      <GameScreen
        difficulty={difficulty}
        onExit={() => setScreen(user ? 'menu' : 'landing')}
        onGameComplete={handleGameComplete}
      />
    );
  }

  if (screen === 'results' && lastResult) {
    return (
      <ResultsScreen
        result={lastResult}
        onPlayAgain={handlePlayAgain}
        onMainMenu={handleMainMenu}
        onViewLeaderboard={handleViewLeaderboard}
      />
    );
  }

  if (screen === 'leaderboard') {
    return <LeaderboardScreen onBack={handleBackToMenu} />;
  }

  if (screen === 'profile' && user) {
    return (
      <ProfileScreen
        onBack={() => setScreen('landing')}
        onLeaderboard={handleViewLeaderboardFromMenu}
      />
    );
  }

  return <LandingScreen onStart={handleStartGuest} onSignIn={handleSignIn} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
