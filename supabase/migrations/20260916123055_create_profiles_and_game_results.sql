/*
# Create player profiles and game results tables

## Purpose
This migration creates the backend data model for the Memory Game: player profiles
and a record of every completed game (score, moves, time, difficulty). This enables
leaderboards, per-player statistics, best-score tracking, and game history.

## New Tables

### 1. `profiles`
- `id` (uuid, primary key) — matches the authenticated user's ID in auth.users
- `display_name` (text, not null) — the player's chosen display name shown on leaderboards
- `avatar_color` (text, default '#3b82f6') — a hex color used to render the player's avatar
- `best_score_easy` (integer, default 0) — best score on Easy difficulty
- `best_score_medium` (integer, default 0) — best score on Medium difficulty
- `best_score_hard` (integer, default 0) — best score on Hard difficulty
- `games_played` (integer, default 0) — total number of games completed
- `total_moves` (integer, default 0) — cumulative moves across all games
- `total_time_seconds` (integer, default 0) — cumulative game time across all games
- `created_at` (timestamptz, default now()) — profile creation timestamp
- `updated_at` (timestamptz, default now()) — last profile update timestamp

### 2. `game_results`
- `id` (uuid, primary key) — unique game result ID
- `user_id` (uuid, not null, defaults to auth.uid()) — the player who played this game
- `difficulty` (text, not null) — one of 'easy', 'medium', 'hard'
- `score` (integer, not null) — final score for this game
- `moves` (integer, not null) — number of moves (pairs attempted)
- `time_seconds` (integer, not null) — game duration in seconds
- `matched_pairs` (integer, not null) — total pairs matched (= total pairs when complete)
- `total_pairs` (integer, not null) — total pairs on the board
- `completed` (boolean, default true) — whether the game was fully completed
- `created_at` (timestamptz, default now()) — when the game was completed

## Foreign Keys
- `profiles.id` → `auth.users(id)` ON DELETE CASCADE
- `game_results.user_id` → `auth.users(id)` ON DELETE CASCADE

## Security — Row Level Security

### profiles
- SELECT: authenticated users can read all profiles (needed for leaderboard)
- INSERT: a user can insert only their own profile
- UPDATE: a user can update only their own profile
- DELETE: a user can delete only their own profile

### game_results
- SELECT: authenticated users can read all game results (needed for leaderboard)
- INSERT: a user can insert only their own game results
- UPDATE: a user can update only their own game results
- DELETE: a user can delete only their own game results

## Indexes
- Index on `game_results(user_id)` for querying a player's game history
- Index on `game_results(difficulty, score desc)` for leaderboard queries
- Index on `game_results(created_at desc)` for recent games

## Notes
1. Both tables have `user_id` or `id` defaulting to `auth.uid()` so frontend inserts
   that omit the owner column still satisfy RLS.
2. Profiles are separate from auth.users to hold game-specific data without touching
   Supabase's managed auth table.
3. Best-score columns on profiles are denormalized for fast reads (leaderboard display).
   They are updated by the application after each game.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Player',
  avatar_color text NOT NULL DEFAULT '#3b82f6',
  best_score_easy integer NOT NULL DEFAULT 0,
  best_score_medium integer NOT NULL DEFAULT 0,
  best_score_hard integer NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  total_moves integer NOT NULL DEFAULT 0,
  total_time_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score integer NOT NULL CHECK (score >= 0),
  moves integer NOT NULL CHECK (moves >= 0),
  time_seconds integer NOT NULL CHECK (time_seconds >= 0),
  matched_pairs integer NOT NULL CHECK (matched_pairs >= 0),
  total_pairs integer NOT NULL CHECK (total_pairs >= 0),
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_game_results" ON game_results;
CREATE POLICY "select_game_results" ON game_results FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_game_result" ON game_results;
CREATE POLICY "insert_own_game_result" ON game_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_game_result" ON game_results;
CREATE POLICY "update_own_game_result" ON game_results FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_game_result" ON game_results;
CREATE POLICY "delete_own_result" ON game_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_difficulty_score ON game_results(difficulty, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);

DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
