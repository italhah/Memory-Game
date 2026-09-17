import { CARD_IMAGES, DIFFICULTY_CONFIG } from './difficultyConfig';

let idCounter = 0;

export function generateId() {
  idCounter += 1;
  return `card-${idCounter}-${Date.now()}`;
}

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDeck(pairs, availableImages = CARD_IMAGES) {
  const selected = shuffleArray(availableImages).slice(0, pairs);
  const deck = shuffleArray(
    selected.flatMap((img) => [
      { id: generateId(), src: img.src, name: img.name, matched: false, flipped: false },
      { id: generateId(), src: img.src, name: img.name, matched: false, flipped: false },
    ])
  );
  return deck;
}

export function calculateScore({ difficulty, moves, timeSeconds, matchedPairs, totalPairs }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) return 0;

  const baseScore = config.baseScore;
  const perfectMoves = totalPairs;
  const movePenalty = Math.max(0, moves - perfectMoves) * 25;
  const timePenalty = Math.floor(timeSeconds * 2);

  let timeBonus = 0;
  if (config.timeLimit) {
    const timeRemaining = Math.max(0, config.timeLimit - timeSeconds);
    timeBonus = Math.floor(timeRemaining * 5);
  }

  const score = Math.max(0, baseScore - movePenalty - timePenalty + timeBonus);
  return score;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPerformanceRating(score, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) return { label: 'Good', stars: 2 };
  const ratio = score / config.baseScore;
  if (ratio >= 0.9) return { label: 'Perfect', stars: 3 };
  if (ratio >= 0.6) return { label: 'Great', stars: 2 };
  if (ratio >= 0.3) return { label: 'Good', stars: 1 };
  return { label: 'Keep Trying', stars: 0 };
}

export function getBestScoreColumn(difficulty) {
  return `best_score_${difficulty}`;
}
