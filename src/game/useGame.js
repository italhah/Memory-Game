import { useState, useCallback, useEffect, useRef } from 'react';
import { createDeck, calculateScore } from './gameUtils';
import { DIFFICULTY_CONFIG } from './difficultyConfig';

export function useGame(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState('idle');
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);

  const timerRef = useRef(null);
  const flippedRef = useRef([]);

  useEffect(() => {
    flippedRef.current = flippedIndices;
  }, [flippedIndices]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  }, [stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setCards([]);
    setFlippedIndices([]);
    flippedRef.current = [];
    setMatchedCount(0);
    setMoves(0);
    setTime(0);
    setStatus('idle');
    setScore(0);
    setIsPaused(false);
    setLockBoard(false);
  }, [stopTimer]);

  const startGame = useCallback(() => {
    const deck = createDeck(config.pairs);
    stopTimer();
    setCards(deck);
    setFlippedIndices([]);
    flippedRef.current = [];
    setMatchedCount(0);
    setMoves(0);
    setTime(0);
    setScore(0);
    setIsPaused(false);
    setLockBoard(false);
    setStatus('playing');
  }, [config.pairs, stopTimer]);

  const pause = useCallback(() => {
    if (status !== 'playing') return;
    stopTimer();
    setIsPaused(true);
    setStatus('paused');
  }, [status, stopTimer]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    setIsPaused(false);
    setStatus('playing');
    startTimer();
  }, [status, startTimer]);

  const handleCardClick = useCallback((index) => {
    if (status !== 'playing' || lockBoard) return;
    if (flippedRef.current.includes(index)) return;
    if (cards[index]?.matched) return;
    if (flippedRef.current.length >= 2) return;

    const newFlipped = [...flippedRef.current, index];
    setFlippedIndices(newFlipped);
    flippedRef.current = newFlipped;

    if (newFlipped.length === 2) {
      setLockBoard(true);
      setMoves((m) => m + 1);

      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.src === secondCard.src) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === first || i === second ? { ...c, matched: true } : c
            )
          );
          setMatchedCount((mc) => mc + 1);
          setFlippedIndices([]);
          flippedRef.current = [];
          setLockBoard(false);
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          flippedRef.current = [];
          setLockBoard(false);
        }, 900);
      }
    }
  }, [status, lockBoard, cards]);

  const timeLimit = config.timeLimit;

  useEffect(() => {
    if (status === 'playing' && !timerRef.current) {
      startTimer();
    }
    return () => {
      if (status !== 'playing' && status !== 'paused') {
        stopTimer();
      }
    };
  }, [status, startTimer, stopTimer]);

  useEffect(() => {
    if (timeLimit && time >= timeLimit && status === 'playing') {
      stopTimer();
      setStatus('timeup');
    }
  }, [time, timeLimit, status, stopTimer]);

  useEffect(() => {
    if (matchedCount > 0 && matchedCount === config.pairs && status === 'playing') {
      stopTimer();
      const finalScore = calculateScore({
        difficulty,
        moves,
        timeSeconds: time,
        matchedPairs: matchedCount,
        totalPairs: config.pairs,
      });
      setScore(finalScore);
      setStatus('won');
    }
  }, [matchedCount, config.pairs, status, difficulty, moves, time, stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return {
    cards,
    flippedIndices,
    matchedCount,
    totalPairs: config.pairs,
    moves,
    time,
    timeLimit,
    status,
    score,
    isPaused,
    lockBoard,
    startGame,
    reset,
    pause,
    resume,
    handleCardClick,
  };
}
