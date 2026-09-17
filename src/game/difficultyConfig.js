import angular from '../card/angular.PNG';
import bootstrap from '../card/bootstrap.PNG';
import github from '../card/github.PNG';
import next from '../card/next.PNG';
import reactLogo from '../card/react.PNG';
import vue from '../card/vue.PNG';

export const CARD_IMAGES = [
  { src: angular, name: 'Angular' },
  { src: bootstrap, name: 'Bootstrap' },
  { src: github, name: 'GitHub' },
  { src: next, name: 'Next.js' },
  { src: reactLogo, name: 'React' },
  { src: vue, name: 'Vue' },
];

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    pairs: 6,
    columns: 4,
    timeLimit: null,
    baseScore: 1000,
    description: '6 pairs · relaxed pace · no timer',
    icon: 'leaf',
    color: '#22c55e',
  },
  medium: {
    label: 'Medium',
    pairs: 8,
    columns: 4,
    timeLimit: 120,
    baseScore: 1500,
    description: '8 pairs · 2 minutes · balanced challenge',
    icon: 'flame',
    color: '#f59e0b',
  },
  hard: {
    label: 'Hard',
    pairs: 12,
    columns: 6,
    timeLimit: 120,
    baseScore: 2500,
    description: '12 pairs · 2 minutes · ultimate test',
    icon: 'zap',
    color: '#ef4444',
  },
};

export const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

export const AVATAR_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6',
];
