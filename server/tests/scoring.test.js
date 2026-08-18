import { GameEngine } from '../src/services/gameEngine.js';

describe('GameEngine - Scoring Algorithm', () => {
  const basePoints = 1000;
  const timeLimitMs = 15000;

  test('Instant correct answer (0ms) gets maximum 1000 points', () => {
    const score = GameEngine.calculateScore(basePoints, 0, timeLimitMs, false);
    expect(score).toBe(1000);
  });

  test('Mid-way answer (7500ms / 50% time) gets 750 points (25% penalty)', () => {
    const score = GameEngine.calculateScore(basePoints, 7500, timeLimitMs, false);
    expect(score).toBe(750);
  });

  test('Last second answer (15000ms) gets 500 points (50% max speed bonus decayed)', () => {
    const score = GameEngine.calculateScore(basePoints, 15000, timeLimitMs, false);
    expect(score).toBe(500);
  });

  test('Late answer exceeding timeLimit gets 0 points', () => {
    const score = GameEngine.calculateScore(basePoints, 16000, timeLimitMs, false);
    expect(score).toBe(0);
  });

  test('Double points multiplier applies 2x to calculated score', () => {
    const regularScore = GameEngine.calculateScore(basePoints, 0, timeLimitMs, false);
    const doubleScore = GameEngine.calculateScore(basePoints, 0, timeLimitMs, true);
    expect(doubleScore).toBe(regularScore * 2);
    expect(doubleScore).toBe(2000);

    const midDouble = GameEngine.calculateScore(basePoints, 7500, timeLimitMs, true);
    expect(midDouble).toBe(1500);
  });
});
