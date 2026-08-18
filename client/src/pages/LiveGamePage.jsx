import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Zap,
  Clock,
  Flame,
  Snowflake,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Award,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQuizSocket } from '../hooks/useQuizSocket';
import { useCountdown } from '../hooks/useCountdown';
import { selectOption, clearFreezeNotice } from '../features/game/gameSlice';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { LoadingState } from '../components/ui/LoadingState';

const TILE_SHAPES = [
  { shape: '▲', name: 'Triangle', bg: 'bg-tile-red hover:bg-rose-700', activeShadow: '#9B1C1C' },
  { shape: '◆', name: 'Diamond', bg: 'bg-accent-teal hover:bg-emerald-800', activeShadow: '#0F5132' },
  { shape: '●', name: 'Circle', bg: 'bg-accent-amber hover:bg-amber-600', activeShadow: '#B27B22' },
  { shape: '■', name: 'Square', bg: 'bg-tile-violet hover:bg-purple-800', activeShadow: '#4C1D95' },
];

export const LiveGamePage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const room = useSelector((state) => state.room);
  const game = useSelector((state) => state.game);

  const isSpectator = room.isSpectator;
  const { submitAnswer, usePowerup } = useQuizSocket(code, isSpectator);

  const { secondsLeft, progressPercent, isExpired } = useCountdown(
    game.endsAt,
    game.timeLimitSec || 15
  );

  const isFrozen = game.frozenUntil > Date.now();
  const [freezeRemaining, setFreezeRemaining] = useState(0);

  useEffect(() => {
    if (isFrozen) {
      const interval = setInterval(() => {
        const rem = Math.max(0, Math.ceil((game.frozenUntil - Date.now()) / 1000));
        setFreezeRemaining(rem);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isFrozen, game.frozenUntil]);

  // Navigate to results when match ends
  useEffect(() => {
    if (game.isFinished) {
      navigate(`/results/${code}`);
    }
  }, [game.isFinished, code, navigate]);

  const handleTileClick = (index) => {
    if (isSpectator || isFrozen || game.selectedOptionIndex !== null || game.revealState) {
      return;
    }
    dispatch(selectOption(index));
    submitAnswer(game.questionIndex, index);
  };

  const handlePowerup = (type) => {
    if (isSpectator || game.powerupsUsed[type] || game.selectedOptionIndex !== null) return;
    usePowerup(type);
  };

  const currentQ = game.currentQuestion;
  const reveal = game.revealState;
  const myPlayerInScoreboard = game.scoreboard.find((p) => p.userId === user?.id);

  if (!currentQ && !game.isFinished) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingState message="Syncing with the live quiz engine..." />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col justify-between select-none">
      {/* Toast Alert for Freeze or Multiplier Notice */}
      {game.freezeNotice && (
        <Toast
          message={`${game.freezeNotice.byUsername} unleashed a FREEZE BLIZZARD on ${game.freezeNotice.targetUsername}!`}
          type="freeze"
          onClose={() => dispatch(clearFreezeNotice())}
        />
      )}

      {/* Top Game Bar: Question Index, Timer Bar, Live Score */}
      <div className="bg-ink-900 border-3 border-ink-950 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#14110F] text-cream-50 mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Question Counter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-bold bg-ink-800 px-3 py-1 rounded-xl border border-ink-700 text-accent-amber">
              Q {game.questionIndex + 1} / {game.totalQuestions}
            </span>
            {isSpectator && (
              <Badge variant="violet" size="xs">
                <Eye className="w-3 h-3" /> Spectating
              </Badge>
            )}
            {game.activeMultiplier === 2 && (
              <Badge variant="coral" size="xs">
                <Flame className="w-3 h-3" /> 2X ACTIVE
              </Badge>
            )}
          </div>

          {/* Timer Clock */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 font-mono font-black text-sm sm:text-base ${
                secondsLeft <= 5
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-ink-950 border-ink-700 text-accent-amber'
              }`}
            >
              <Clock className="w-4 h-4" />
              {secondsLeft}s
            </div>
          </div>

          {/* Current Player Rank & Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cream-300 hidden sm:inline">Score:</span>
            <span className="font-mono font-black text-lg sm:text-xl text-accent-amber">
              {myPlayerInScoreboard ? myPlayerInScoreboard.score : 0} pts
            </span>
          </div>
        </div>

        {/* Smooth Countdown Progress Bar */}
        <div className="w-full bg-ink-950 h-3 rounded-full overflow-hidden border border-ink-700">
          <div
            className={`h-full transition-all duration-75 ${
              progressPercent > 50
                ? 'bg-accent-teal'
                : progressPercent > 25
                ? 'bg-accent-amber'
                : 'bg-accent-coral'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Board */}
      <div className="relative mb-6">
        <div className="bg-cream-50 border-3 border-ink-900 rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#14110F] text-center min-h-[160px] flex items-center justify-center">
          <h2 className="text-xl sm:text-3xl font-display font-extrabold text-ink-950 leading-tight">
            {currentQ.text}
          </h2>
        </div>

        {/* Frozen Lock Overlay if Enemy Player Froze Us */}
        {isFrozen && (
          <div className="absolute inset-0 bg-cyan-900/80 backdrop-blur-sm rounded-3xl border-4 border-cyan-400 flex flex-col items-center justify-center text-white z-20 animate-pop-in">
            <Snowflake className="w-16 h-16 text-cyan-300 animate-spin mb-2" />
            <h3 className="text-2xl font-display font-black text-cyan-100 uppercase tracking-widest">
              YOU ARE FROZEN!
            </h3>
            <p className="font-mono text-sm text-cyan-200 mt-1">
              Buzzers unlocking in {freezeRemaining}s...
            </p>
          </div>
        )}
      </div>

      {/* 2x2 Game Show Buzzer Answer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {currentQ.options.map((option, idx) => {
          const isSelected = game.selectedOptionIndex === idx;
          const isRemovedBy5050 = game.removedOptionIndices.includes(idx);
          const tileConfig = TILE_SHAPES[idx % 4];

          // Check if reveal state is active
          const isCorrectAnswer = reveal && reveal.correctIndex === idx;
          const isWrongSelected = reveal && isSelected && !isCorrectAnswer;

          let tileStateClasses = `${tileConfig.bg} text-white`;

          if (isRemovedBy5050) {
            tileStateClasses =
              'bg-cream-300/40 text-ink-400 opacity-20 border-dashed border-ink-400 cursor-not-allowed pointer-events-none';
          } else if (reveal) {
            if (isCorrectAnswer) {
              tileStateClasses =
                'bg-emerald-600 text-white ring-4 ring-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-bounce';
            } else if (isWrongSelected) {
              tileStateClasses = 'bg-rose-700 text-white opacity-60 animate-shake';
            } else {
              tileStateClasses = 'bg-ink-800 text-ink-500 opacity-40';
            }
          } else if (isSelected) {
            tileStateClasses =
              'bg-ink-950 text-accent-amber ring-4 ring-accent-amber shadow-none translate-y-1';
          }

          return (
            <button
              key={idx}
              disabled={
                isSpectator ||
                isFrozen ||
                isRemovedBy5050 ||
                game.selectedOptionIndex !== null ||
                !!reveal
              }
              onClick={() => handleTileClick(idx)}
              className={`btn-buzzer relative p-5 sm:p-7 rounded-2xl border-3 border-ink-950 font-display font-bold text-base sm:text-xl text-left flex items-center gap-4 transition-all duration-75 shadow-[4px_4px_0px_0px_#14110F] ${tileStateClasses}`}
            >
              {/* Shape Badge */}
              <span className="w-10 h-10 rounded-xl bg-black/25 flex items-center justify-center font-mono font-black text-lg shrink-0 border border-white/20">
                {tileConfig.shape}
              </span>

              <span className="flex-1 leading-snug">{isRemovedBy5050 ? '—' : option}</span>

              {/* Status Icons during Reveal */}
              {reveal && isCorrectAnswer && (
                <CheckCircle2 className="w-7 h-7 text-emerald-300 shrink-0" />
              )}
              {reveal && isWrongSelected && <XCircle className="w-7 h-7 text-rose-300 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner during Reveal Phase */}
      {reveal && reveal.explanation && (
        <div className="bg-amber-50 border-2 border-amber-600 rounded-2xl p-4 mb-6 shadow-[3px_3px_0px_0px_#B27B22] animate-slide-up text-left">
          <div className="flex items-center gap-2 font-display font-bold text-amber-900 text-sm mb-1">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            Trivia Fact & Explanation:
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-medium">{reveal.explanation}</p>
        </div>
      )}

      {/* Tactical Power-Up Bar (Disabled for Spectators or when already chosen) */}
      {!isSpectator && (
        <div className="bg-cream-100 border-2 border-ink-900 rounded-2xl p-3 shadow-[3px_3px_0px_0px_#14110F] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-display font-bold text-ink-800">
            <Zap className="w-4 h-4 text-accent-amber" />
            Tactical Arsenal:
          </div>

          <div className="flex items-center gap-2">
            {/* 50:50 */}
            <button
              disabled={
                game.powerupsUsed.fiftyFifty ||
                game.selectedOptionIndex !== null ||
                !!reveal ||
                isFrozen
              }
              onClick={() => handlePowerup('fiftyFifty')}
              className={`px-3 py-1.5 rounded-xl border-2 font-display font-bold text-xs flex items-center gap-1.5 transition-all ${
                game.powerupsUsed.fiftyFifty
                  ? 'bg-cream-300 border-ink-400 text-ink-400 line-through cursor-not-allowed'
                  : 'bg-accent-amber text-ink-950 border-ink-900 shadow-[2px_2px_0px_0px_#14110F] hover:bg-amber-400 active:translate-x-[1px] active:translate-y-[1px]'
              }`}
            >
              50:50
            </button>

            {/* 2x Double Points */}
            <button
              disabled={
                game.powerupsUsed.doublePoints ||
                game.selectedOptionIndex !== null ||
                !!reveal ||
                isFrozen
              }
              onClick={() => handlePowerup('doublePoints')}
              className={`px-3 py-1.5 rounded-xl border-2 font-display font-bold text-xs flex items-center gap-1.5 transition-all ${
                game.powerupsUsed.doublePoints
                  ? 'bg-cream-300 border-ink-400 text-ink-400 line-through cursor-not-allowed'
                  : 'bg-accent-coral text-white border-ink-900 shadow-[2px_2px_0px_0px_#14110F] hover:bg-rose-500 active:translate-x-[1px] active:translate-y-[1px]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              2x Score
            </button>

            {/* Freeze Rival */}
            <button
              disabled={
                game.powerupsUsed.freeze ||
                game.selectedOptionIndex !== null ||
                !!reveal ||
                isFrozen
              }
              onClick={() => handlePowerup('freeze')}
              className={`px-3 py-1.5 rounded-xl border-2 font-display font-bold text-xs flex items-center gap-1.5 transition-all ${
                game.powerupsUsed.freeze
                  ? 'bg-cream-300 border-ink-400 text-ink-400 line-through cursor-not-allowed'
                  : 'bg-cyan-600 text-white border-ink-900 shadow-[2px_2px_0px_0px_#14110F] hover:bg-cyan-500 active:translate-x-[1px] active:translate-y-[1px]'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              Freeze Rival
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
