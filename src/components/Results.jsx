import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Sparkles, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export default function Results({ players, totalQuestions, onPlayAgain }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentUser = players.find(p => p.isCurrentUser);
  const currentUserRank = sortedPlayers.findIndex(p => p.isCurrentUser) + 1;

  // Fire celebratory confetti on mount if user is top 3!
  useEffect(() => {
    if (currentUserRank <= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C59B27', '#E8E1D3', '#2D6A4F']
        });
      } catch (err) {
        // Fallback silently if canvas-confetti unavailable
      }
    }
  }, [currentUserRank]);

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-slide">
      {/* Header */}
      <div className="text-center mb-10 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-300 dark:border-stone-800 text-xs tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-4 bg-paper-100/50 dark:bg-paper-900/50">
          <Award className="w-3.5 h-3.5 text-accent" />
          <span>Final Verdict & Rankings</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-paper-900 dark:text-paper-50 mb-3">
          The Honors Board
        </h1>
        <p className="font-serif italic text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          Recognizing the finest scholars of general knowledge.
        </p>
      </div>

      {/* Podium Display (Top 3) */}
      <div className="mb-12 pt-6">
        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto min-h-[220px]">
          {/* 2nd Place */}
          {top2 && (
            <div className="flex-1 flex flex-col items-center animate-fade-slide">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-base mb-2 border-2 border-stone-300 dark:border-stone-600 shadow-sm ${top2.avatarBg}`}>
                {top2.initials}
              </div>
              <span className="text-xs sm:text-sm font-medium text-paper-900 dark:text-paper-100 text-center truncate max-w-[100px]">
                {top2.name}
              </span>
              <span className="font-serif text-xs font-bold text-accent mb-2">
                {top2.score} pts
              </span>
              <div className="w-full bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-t-lg h-28 flex flex-col items-center justify-center p-2">
                <span className="font-serif text-xl font-bold text-stone-600 dark:text-stone-400">2nd</span>
                <span className="text-[10px] uppercase text-stone-500 tracking-wider">Silver</span>
              </div>
            </div>
          )}

          {/* 1st Place (Center / Tallest) */}
          {top1 && (
            <div className="flex-1 flex flex-col items-center animate-fade-slide">
              <div className="relative mb-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-serif font-bold text-lg border-2 border-accent shadow-editorial ${top1.avatarBg}`}>
                  {top1.initials}
                </div>
                <Trophy className="w-5 h-5 text-accent absolute -top-3 left-1/2 -translate-x-1/2 fill-accent" />
              </div>
              <span className="text-sm sm:text-base font-bold text-paper-900 dark:text-paper-100 text-center truncate max-w-[120px]">
                {top1.name}
              </span>
              <span className="font-serif text-sm font-bold text-accent mb-2">
                {top1.score} pts
              </span>
              <div className="w-full bg-accent/15 dark:bg-accent/20 border-2 border-accent rounded-t-lg h-36 flex flex-col items-center justify-center p-2 shadow-editorial">
                <span className="font-serif text-3xl font-bold text-accent">1st</span>
                <span className="text-[10px] uppercase text-accent font-bold tracking-widest">Laureate</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="flex-1 flex flex-col items-center animate-fade-slide">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-base mb-2 border-2 border-amber-700/40 dark:border-amber-600/40 shadow-sm ${top3.avatarBg}`}>
                {top3.initials}
              </div>
              <span className="text-xs sm:text-sm font-medium text-paper-900 dark:text-paper-100 text-center truncate max-w-[100px]">
                {top3.name}
              </span>
              <span className="font-serif text-xs font-bold text-accent mb-2">
                {top3.score} pts
              </span>
              <div className="w-full bg-stone-200/50 dark:bg-stone-800/50 border border-stone-300 dark:border-stone-700 rounded-t-lg h-20 flex flex-col items-center justify-center p-2">
                <span className="font-serif text-lg font-bold text-amber-700 dark:text-amber-500">3rd</span>
                <span className="text-[10px] uppercase text-stone-500 tracking-wider">Bronze</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Personal Summary Card */}
      <div className="p-6 rounded-lg border border-accent/60 bg-accent/5 dark:bg-accent/10 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent text-paper-950 flex items-center justify-center font-serif font-bold text-xl shrink-0">
            #{currentUserRank}
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-paper-900 dark:text-paper-100">
              Your Performance Summary
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Ranked #{currentUserRank} of {players.length} participants with {currentUser?.score.toLocaleString()} points.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 divide-x divide-stone-300 dark:divide-stone-800 text-center">
          <div className="px-2">
            <span className="font-serif text-2xl font-bold text-accent block">
              {currentUser?.correctCount || 0}/{totalQuestions}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-stone-500">Correct Answers</span>
          </div>

          <div className="pl-6 px-2">
            <span className="font-serif text-2xl font-bold text-emeraldCustom block">
              {Math.round(((currentUser?.correctCount || 0) / totalQuestions) * 100)}%
            </span>
            <span className="text-[10px] uppercase tracking-wider text-stone-500">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Complete Rankings Table */}
      <div className="p-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-paper-100/40 dark:bg-paper-900/40 mb-10">
        <h3 className="font-serif text-xl font-normal text-paper-900 dark:text-paper-100 mb-4 pb-3 border-b border-stone-200 dark:border-stone-800">
          Full Chamber Roster
        </h3>

        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`py-3.5 px-3 rounded flex items-center justify-between transition-colors ${
                player.isCurrentUser ? 'bg-accent/10 font-semibold' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className={`w-6 font-serif font-bold text-sm text-center ${idx < 3 ? 'text-accent' : 'text-stone-500'}`}>
                  #{idx + 1}
                </span>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold ${player.avatarBg}`}>
                  {player.initials}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-paper-900 dark:text-paper-100">
                      {player.name}
                    </span>
                    {player.isCurrentUser && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-500">
                    {player.title}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-serif text-base font-bold text-accent block">
                  {player.score.toLocaleString()} pts
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                  {player.correctCount} correct
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="text-center">
        <button
          onClick={onPlayAgain}
          type="button"
          className="px-8 py-3.5 rounded bg-accent hover:bg-accent-hover text-paper-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-editorial inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Play Again / New Session</span>
        </button>
      </div>
    </div>
  );
}
