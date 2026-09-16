import { supabase } from './supabaseClient';

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProfile(userId, displayName, avatarColor) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      display_name: displayName,
      avatar_color: avatarColor,
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveGameResult({ userId, difficulty, score, moves, timeSeconds, matchedPairs, totalPairs, completed }) {
  const { data, error } = await supabase
    .from('game_results')
    .insert({
      user_id: userId,
      difficulty,
      score,
      moves,
      time_seconds: timeSeconds,
      matched_pairs: matchedPairs,
      total_pairs: totalPairs,
      completed,
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateBestScore(userId, difficulty, score) {
  const column = `best_score_${difficulty}`;
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select(column)
    .eq('id', userId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!profile) return null;

  const currentBest = profile[column] || 0;
  if (score <= currentBest) return null;

  return updateProfile(userId, { [column]: score });
}

export async function incrementProfileStats(userId, moves, timeSeconds) {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('games_played, total_moves, total_time_seconds')
    .eq('id', userId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!profile) return null;

  return updateProfile(userId, {
    games_played: (profile.games_played || 0) + 1,
    total_moves: (profile.total_moves || 0) + moves,
    total_time_seconds: (profile.total_time_seconds || 0) + timeSeconds,
  });
}

export async function fetchLeaderboard(difficulty, limit = 10) {
  const column = `best_score_${difficulty}`;
  const { data, error } = await supabase
    .from('profiles')
    .select(`id, display_name, avatar_color, ${column}`)
    .gt(column, 0)
    .order(column, { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchGameHistory(userId, limit = 20) {
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchRecentGames(limit = 10) {
  const { data, error } = await supabase
    .from('game_results')
    .select(`
      id,
      difficulty,
      score,
      moves,
      time_seconds,
      created_at,
      profiles!inner(display_name, avatar_color)
    `)
    .eq('completed', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
