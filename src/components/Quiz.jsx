import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Trophy, Flame, ChevronRight, Volume2, VolumeX, BookOpen, Sparkles, Shield } from 'lucide-react';

export default function Quiz({ questions, currentQIndex, onAnswerSubmit, onNextQuestion, players, setPlayers }) {
  const currentQuestion = questions[currentQIndex];
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer countdown hook
  useEffect(() => {
    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswered(false);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isAnswered) {
            handleOptionClick(-1, true); // Timeout auto-submit
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQIndex]);

  // Simulate other players periodically answering questions and gaining score!
  useEffect(() => {
    if (isAnswered) return;

    const simInterval = setInterval(() => {
      setPlayers(prev =>
        prev.map(player => {
          if (player.isCurrentUser) return player;
          const randomIncrement = Math.random() > 0.35 ? Math.floor(Math.random() * 85) + 15 : 0;
          return {
            ...player,
            score: player.score + randomIncrement,
            streak: randomIncrement > 0 ? player.streak + 1 : 0
          };
        })
      );
    }, 3200);

    return () => clearInterval(simInterval);
  }, [isAnswered, setPlayers]);

  const handleOptionClick = (index, isTimeout = false) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctAnswer;
    const speedBonus = isCorrect ? Math.floor((timeLeft / 15) * 500) : 0;
    const pointsEarned = isCorrect ? 1000 + speedBonus : 0;

    // Update user score in players list
    setPlayers(prev =>
      prev.map(p => {
        if (p.isCurrentUser) {
          const newStreak = isCorrect ? p.streak + 1 : 0;
          return {
            ...p,
            score: p.score + pointsEarned,
            correctCount: isCorrect ? p.correctCount + 1 : p.correctCount,
            streak: newStreak
          };
        }
        return p;
      })
    );

    onAnswerSubmit({
      questionId: currentQuestion.id,
      selectedOption: index,
      isCorrect,
      pointsEarned,
      isTimeout
    });
  };

  // Sort players for live leaderboard display
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentUserRank = sortedPlayers.findIndex(p => p.isCurrentUser) + 1;

  const isTimeCritical = timeLeft <= 4 && !isAnswered;
  const questionProgress = ((currentQIndex + 1) / questions.length) * 100;

  // Radial SVG Timer math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / 15);

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-12 lg:px-16 py-6 lg:py-8 animate-fade-slide">
      {/* Editorial Top Navigation & Header Row */}
      <header className="border-y border-stone-200 dark:border-stone-800/80 py-4 mb-8 flex items-center justify-between gap-4">
        {/* Category & Metadata */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest px-3 py-1 rounded bg-accent/15 text-accent font-semibold border border-accent/25">
            {currentQuestion.category}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider hidden xs:inline">
            • {currentQuestion.difficulty}
          </span>
        </div>

        {/* Right side: Timer & Sound Controls */}
        <div className="flex items-center gap-6">
          {/* Radial Countdown Timer */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-stone-200 dark:stroke-stone-800"
                  strokeWidth="3"
                  fill="transparent"
                />
                {/* Foreground Animated Ring */}
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className={`transition-all duration-1000 ease-linear ${
                    isTimeCritical ? 'stroke-rose-500' : 'stroke-accent'
                  }`}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className={`absolute text-xs font-mono font-bold ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-paper-900 dark:text-paper-100'}`}>
                {timeLeft}s
              </span>
            </div>

            <div className="hidden sm:block text-left">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
                Time Remaining
              </span>
              <span className="text-xs font-mono font-semibold text-paper-900 dark:text-paper-100">
                15 SEC LIMIT
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200 dark:bg-stone-800"></div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-accent hover:border-accent transition-colors cursor-pointer"
            title={soundEnabled ? "Mute Timer Sounds" : "Enable Sound Effects"}
            type="button"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mobile Leaderboard Drawer Trigger */}
          <button
            onClick={() => setShowMobileLeaderboard(!showMobileLeaderboard)}
            type="button"
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-xs uppercase tracking-wider text-accent font-semibold cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Rank #{currentUserRank}</span>
          </button>
        </div>
      </header>

      {/* Main Grid: 65/35 Split between Question Canvas & Leaderboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (8 cols): Quiz Question & Options Canvas */}
        <div className="lg:col-span-8 space-y-8">
          {/* Question Index & Smooth Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium tracking-wider">
              <span>
                QUESTION <strong className="text-paper-900 dark:text-paper-100 font-serif text-base">{currentQIndex + 1}</strong> OF {questions.length}
              </span>
              <span className="font-mono text-accent">
                {Math.round(questionProgress)}% COMPLETE
              </span>
            </div>

            {/* Slim Crafted Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${questionProgress}%` }}
              />
            </div>
          </div>

          {/* Large Serif Question Statement */}
          <div className="py-4">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.2] text-paper-900 dark:text-paper-50 tracking-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 4 Answer Options */}
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQuestion.correctAnswer;
              
              let optionClasses = "border-stone-200 dark:border-stone-800/80 bg-paper-100/50 dark:bg-paper-900/40 text-paper-900 dark:text-paper-100 hover:border-accent/60 hover:bg-paper-100 dark:hover:bg-paper-900/70 hover:shadow-subtle";
              let barClasses = "bg-transparent group-hover:bg-accent/40";
              let badgeClasses = "bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-accent group-hover:text-paper-950";

              if (isAnswered) {
                if (isCorrectAnswer) {
                  optionClasses = "border-emeraldCustom/80 bg-emeraldCustom/10 text-emerald-900 dark:text-emerald-100 shadow-sm";
                  barClasses = "bg-emeraldCustom";
                  badgeClasses = "bg-emeraldCustom text-paper-50";
                } else if (isSelected && !isCorrectAnswer) {
                  optionClasses = "border-crimson/80 bg-crimson/10 text-crimson-dark dark:text-crimson-light";
                  barClasses = "bg-crimson";
                  badgeClasses = "bg-crimson text-paper-50";
                } else {
                  optionClasses = "border-stone-200/40 dark:border-stone-800/30 opacity-45 bg-paper-50/40 dark:bg-paper-950/40";
                  barClasses = "bg-transparent";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  type="button"
                  className={`w-full p-5 sm:p-6 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group cursor-pointer relative overflow-hidden ${optionClasses}`}
                >
                  {/* Left Accent Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${barClasses}`} />

                  <div className="flex items-center gap-4 pl-2">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-base font-bold shrink-0 transition-colors ${badgeClasses}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-normal leading-snug">
                      {option}
                    </span>
                  </div>

                  {/* Feedback Status Icon */}
                  {isAnswered && (
                    <div className="shrink-0 ml-3">
                      {isCorrectAnswer && (
                        <div className="w-7 h-7 rounded-full bg-emeraldCustom/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emeraldCustom" />
                        </div>
                      )}
                      {isSelected && !isCorrectAnswer && (
                        <div className="w-7 h-7 rounded-full bg-crimson/20 flex items-center justify-center">
                          <X className="w-4 h-4 text-crimson" />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Historical Context Card (Designed Reveal Moment) */}
          {isAnswered && (
            <div className="mt-8 p-6 sm:p-8 rounded-xl border border-accent/30 bg-accent/10 dark:bg-accent/15 border-l-4 border-l-accent shadow-sm animate-fade-slide space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Historical Insight</span>
                </div>
                <Sparkles className="w-4 h-4 text-accent/60" />
              </div>

              <p className="font-serif italic text-lg text-paper-900 dark:text-paper-100 leading-relaxed">
                "{currentQuestion.explanation}"
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onNextQuestion}
                  type="button"
                  className="px-8 py-3.5 rounded bg-accent hover:bg-accent-hover text-paper-950 text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-subtle group"
                >
                  <span>{currentQIndex < questions.length - 1 ? 'Proceed to Next Question' : 'View Final Honors'}</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Live Multiplayer Leaderboard Panel */}
        <div
          className={`lg:col-span-4 ${
            showMobileLeaderboard
              ? 'block fixed inset-x-0 bottom-0 z-40 bg-paper-50 dark:bg-paper-950 border-t border-stone-300 dark:border-stone-800 p-6 shadow-2xl rounded-t-2xl lg:relative lg:inset-auto lg:z-auto lg:border-t-0 lg:p-0 lg:shadow-none'
              : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-12 p-6 sm:p-8 rounded-xl border border-stone-200 dark:border-stone-800/80 bg-paper-100/60 dark:bg-paper-900/50 space-y-6 shadow-subtle">
            {/* Leaderboard Panel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-xl font-normal text-paper-900 dark:text-paper-100">
                  Live Standings
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emeraldCustom font-semibold bg-emeraldCustom/10 px-2.5 py-1 rounded-full border border-emeraldCustom/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emeraldCustom animate-ping"></span>
                <span>Real-Time Feed</span>
              </div>
            </div>

            {/* Leaderboard Players List */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sortedPlayers.map((player, rankIdx) => (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                    player.isCurrentUser
                      ? 'border-accent/70 bg-accent/15 dark:bg-accent/20 shadow-subtle'
                      : 'border-stone-200/80 dark:border-stone-800/80 bg-paper-50 dark:bg-paper-950'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-6 font-serif font-bold text-center text-base ${rankIdx === 0 ? 'text-accent text-lg' : 'text-stone-500'}`}>
                      #{rankIdx + 1}
                    </span>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold shrink-0 ${player.avatarBg}`}>
                      {player.initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-paper-900 dark:text-paper-100">
                          {player.name}
                        </span>
                        {player.isCurrentUser && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-paper-950 font-bold">
                            You
                          </span>
                        )}
                        {player.streak > 1 && (
                          <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-semibold" title={`${player.streak} Streak!`}>
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                        {player.title}
                      </span>
                    </div>
                  </div>

                  <span className="font-serif font-bold text-base text-accent">
                    {player.score.toLocaleString()} <span className="text-[10px] text-stone-500 font-sans uppercase font-normal">pts</span>
                  </span>
                </div>
              ))}
            </div>

            {showMobileLeaderboard && (
              <button
                onClick={() => setShowMobileLeaderboard(false)}
                type="button"
                className="w-full mt-4 py-2.5 bg-stone-200 dark:bg-stone-800 text-xs font-semibold uppercase tracking-wider rounded text-paper-800 dark:text-paper-200 lg:hidden"
              >
                Close Drawer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
