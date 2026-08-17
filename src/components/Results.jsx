import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Sparkles, CheckCircle2, ShieldCheck, Flame, Crown } from 'lucide-react';

export default function Results({ players, totalQuestions, onPlayAgain }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentUser = players.find(p => p.isCurrentUser);
  const currentUserRank = sortedPlayers.findIndex(p => p.isCurrentUser) + 1;

  // Fire celebratory confetti on mount if user is top 3!
  useEffect(() => {
    if (currentUserRank <= 3) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#D4AF37', '#F6F2EA', '#047857']
        });
      } catch (err) {
        // Fallback silently
      }
    }
  }, [currentUserRank]);

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  return (
    <div className="max-w-[1320px] mx-auto px-6 sm:px-12 lg:px-16 py-10 sm:py-14 animate-fade-slide relative">
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/10 dark:bg-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 dark:bg-accent/15 text-xs font-bold uppercase tracking-widest text-accent mb-6 shadow-subtle backdrop-blur-md">
          <Award className="w-3.5 h-3.5 text-accent animate-bounce" />
          <span>Final Verdict & Rankings</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-paper-900 dark:text-paper-50 mb-4">
          The Honors Board
        </h1>
        <p className="font-serif italic text-xl sm:text-2xl text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Recognizing the finest scholars of general knowledge.
        </p>
      </div>

      {/* 3D Podium Display (Top 3) */}
      <div className="mb-14 pt-4">
        <div className="flex items-end justify-center gap-4 sm:gap-8 max-w-3xl mx-auto min-h-[260px]">
          {/* 2nd Place */}
          {top2 && (
            <div className="flex-1 flex flex-col items-center animate-fade-slide">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-serif font-bold text-lg mb-3 border-2 border-stone-300 dark:border-stone-600 shadow-elevated ${top2.avatarBg}`}>
                {top2.initials}
              </div>
              <span className="text-sm sm:text-base font-bold text-paper-900 dark:text-paper-100 text-center truncate max-w-[120px]">
                {top2.name}
              </span>
              <span className="font-serif text-sm font-bold text-accent mb-3">
                {top2.score.toLocaleString()} pts
              </span>
              <div className="w-full bg-stone-200/90 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 rounded-t-2xl h-32 flex flex-col items-center justify-center p-3 shadow-elevated backdrop-blur-md">
                <span className="font-serif text-3xl font-bold text-stone-600 dark:text-stone-400">2nd</span>
                <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest mt-1">Silver Laureate</span>
              </div>
            </div>
          )}

          {/* 1st Place (Center / Tallest with Crown) */}
          {top1 && (
            <div className="flex-1 flex flex-col items-center animate-fade-slide">
              <div className="relative mb-3">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-serif font-bold text-2xl border-4 border-accent shadow-glow-accent ${top1.avatarBg}`}>
                  {top1.initials}
                </div>
                <Crown className="w-7 h-7 text-accent absolute -top-5 left-1/2 -translate-x-1/2 fill-accent animate-bounce" />
              </div>
              <span className="text-base sm:text-lg font-bold text-paper-900 dark:text-paper-100 text-center truncate max-w-[140px]">
                {top1.name}
              </span>
              <span className="font-serif text-base font-bold text-accent mb-3">
                {top1.score.toLocaleString()} pts
              </span>
              <div className="w-full bg-accent/20 dark:bg-accent/25 border-2 border-accent rounded-t-2xl h-44 flex flex-col items-center justify-center p-4 shadow-glow-accent backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent pointer-events-none" />
                <span className="font-serif text-5xl font-bold text-accent drop-shadow-sm">1st</span>
                <span className="text-[11px] uppercase text-accent font-extrabold tracking-widest mt-1">Grand Champion</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <div className="flex-1 flex flex-col items-center animate-fade-slide">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-serif font-bold text-lg mb-3 border-2 border-amber-700/50 dark:border-amber-600/50 shadow-elevated ${top3.avatarBg}`}>
                {top3.initials}
              </div>
              <span className="text-sm sm:text-base font-bold text-paper-900 dark:text-paper-100 text-center truncate max-w-[120px]">
                {top3.name}
              </span>
              <span className="font-serif text-sm font-bold text-accent mb-3">
                {top3.score.toLocaleString()} pts
              </span>
              <div className="w-full bg-stone-200/60 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-t-2xl h-24 flex flex-col items-center justify-center p-3 shadow-elevated backdrop-blur-md">
                <span className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-500">3rd</span>
                <span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest mt-1">Bronze Laureate</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Personal Performance Summary Card */}
      <div className="p-8 rounded-2xl border border-accent/60 bg-accent/10 dark:bg-accent/15 backdrop-blur-md mb-12 shadow-glow-accent flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent text-paper-950 flex items-center justify-center font-serif font-bold text-2xl shrink-0 shadow-elevated">
            #{currentUserRank}
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-paper-900 dark:text-paper-100">
              Your Performance Summary
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
              Ranked #{currentUserRank} of {players.length} participants with {currentUser?.score.toLocaleString()} points.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 divide-x divide-stone-300 dark:divide-stone-800 text-center">
          <div className="px-2">
            <span className="font-serif text-3xl font-bold text-accent block">
              {currentUser?.correctCount || 0}/{totalQuestions}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Correct Answers</span>
          </div>

          <div className="pl-8 px-2">
            <span className="font-serif text-3xl font-bold text-emeraldCustom block">
              {Math.round(((currentUser?.correctCount || 0) / totalQuestions) * 100)}%
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Complete Rankings Table */}
      <div className="p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-paper-50/80 dark:bg-paper-900/60 backdrop-blur-md mb-12 shadow-elevated">
        <h3 className="font-serif text-2xl font-normal text-paper-900 dark:text-paper-100 mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
          Full Chamber Roster
        </h3>

        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`py-4 px-4 rounded-xl flex items-center justify-between transition-colors ${
                player.isCurrentUser ? 'bg-accent/15 font-bold border border-accent/40 shadow-subtle' : 'hover:bg-paper-100/50 dark:hover:bg-paper-950/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-6 font-serif font-bold text-base text-center ${idx < 3 ? 'text-accent text-lg' : 'text-stone-500'}`}>
                  #{idx + 1}
                </span>

                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-xs font-bold shadow-subtle ${player.avatarBg}`}>
                  {player.initials}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-paper-900 dark:text-paper-100 font-semibold">
                      {player.name}
                    </span>
                    {player.isCurrentUser && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-paper-950 font-bold">
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
                <span className="font-serif text-lg font-bold text-accent block">
                  {player.score.toLocaleString()} pts
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">
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
          className="px-10 py-4 rounded-xl bg-accent hover:bg-accent-hover text-paper-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-glow-accent inline-flex items-center gap-3 cursor-pointer hover:scale-[1.02]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Play Again / New Session</span>
        </button>
      </div>
    </div>
  );
}
