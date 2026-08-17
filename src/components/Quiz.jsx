import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Trophy, Flame, ChevronRight, Volume2, VolumeX, BookOpen, Sparkles } from 'lucide-react';

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
  const currentUser = players.find(p => p.isCurrentUser);

  const isTimeCritical = timeLeft <= 4 && !isAnswered;
  const questionProgress = ((currentQIndex + 1) / questions.length) * 100;

  // Radial SVG Timer math
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / 15);

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-4 lg:py-6 animate-fade-slide relative">
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Row (Clears top fixed theme button cleanly) */}
      <header className="pr-28 sm:pr-36 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800/80 pb-4">
        {/* Category Pill & Progress Info */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-accent/15 text-accent font-bold border border-accent/30 shadow-subtle flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentQuestion.category}</span>
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider">
            Question <strong className="text-paper-900 dark:text-paper-100 font-serif text-sm">{currentQIndex + 1}</strong> of {questions.length}
          </span>
        </div>

        {/* Center/Right: Progress Bar & Radial Countdown */}
        <div className="flex items-center gap-6">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3 w-44">
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${questionProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-accent">
              {Math.round(questionProgress)}%
            </span>
          </div>

          {/* Radial Countdown Timer */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-stone-200 dark:stroke-stone-800"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
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
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full border border-stone-200 dark:border-stone-800 bg-paper-50 dark:bg-paper-900 text-stone-500 hover:text-accent hover:border-accent transition-all cursor-pointer"
            title={soundEnabled ? "Mute Timer Sounds" : "Enable Sound Effects"}
            type="button"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-accent" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile Leaderboard Trigger */}
          <button
            onClick={() => setShowMobileLeaderboard(!showMobileLeaderboard)}
            type="button"
            className="lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-xs font-bold text-accent"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>#{currentUserRank}</span>
          </button>
        </div>
      </header>

      {/* Main Grid: PERFECT EQUAL HEIGHT SIDE-BY-SIDE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Panel (8 cols): Question Canvas & Options (Single Viewport Container, No Page Scroll) */}
        <div className="lg:col-span-8 bg-paper-50/90 dark:bg-paper-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between shadow-elevated backdrop-blur-md min-h-[540px]">
          
          {/* Top: Large Serif Question Statement */}
          <div>
            <div className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold mb-2">
              Question Statement
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug text-paper-900 dark:text-paper-50 tracking-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Middle: 4 Answer Options */}
          <div className="my-6 space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQuestion.correctAnswer;

              let optionClasses = "border-stone-200 dark:border-stone-800 bg-paper-100/60 dark:bg-paper-950/60 text-paper-900 dark:text-paper-100 hover:border-accent hover:bg-paper-100 dark:hover:bg-paper-950";
              let barClasses = "bg-transparent group-hover:bg-accent";
              let badgeClasses = "bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-accent group-hover:text-paper-950";

              if (isAnswered) {
                if (isCorrectAnswer) {
                  optionClasses = "border-emeraldCustom bg-emeraldCustom/15 text-emerald-950 dark:text-emerald-100 shadow-glow-emerald";
                  barClasses = "bg-emeraldCustom";
                  badgeClasses = "bg-emeraldCustom text-paper-50";
                } else if (isSelected && !isCorrectAnswer) {
                  optionClasses = "border-crimson bg-crimson/15 text-crimson-dark dark:text-crimson-light animate-shake";
                  barClasses = "bg-crimson";
                  badgeClasses = "bg-crimson text-paper-50";
                } else {
                  optionClasses = "border-stone-200/40 dark:border-stone-800/30 opacity-40 bg-paper-50/40 dark:bg-paper-950/40";
                  barClasses = "bg-transparent";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  type="button"
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group cursor-pointer relative overflow-hidden ${optionClasses}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${barClasses}`} />

                  <div className="flex items-center gap-3.5 pl-2">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm font-bold shrink-0 transition-all ${badgeClasses}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-normal leading-snug">
                      {option}
                    </span>
                  </div>

                  {isAnswered && (
                    <div className="shrink-0 ml-3">
                      {isCorrectAnswer && (
                        <div className="w-7 h-7 rounded-full bg-emeraldCustom text-paper-50 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                      {isSelected && !isCorrectAnswer && (
                        <div className="w-7 h-7 rounded-full bg-crimson text-paper-50 flex items-center justify-center">
                          <X className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Area: Historical Insight (Fact Reveal) INLINE inside the left panel — ZERO SCROLLING NEEDED! */}
          {isAnswered ? (
            <div className="p-4 sm:p-5 rounded-xl border border-accent/40 bg-accent/10 dark:bg-accent/15 border-l-4 border-l-accent animate-fade-slide flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Historical Insight</span>
                </div>
                <p className="font-serif italic text-sm sm:text-base text-paper-900 dark:text-paper-100 leading-snug">
                  "{currentQuestion.explanation}"
                </p>
              </div>

              <button
                onClick={onNextQuestion}
                type="button"
                className="shrink-0 px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-paper-950 text-xs font-bold uppercase tracking-widest transition-all shadow-glow-accent flex items-center gap-2 cursor-pointer group"
              >
                <span>{currentQIndex < questions.length - 1 ? 'Next' : 'Results'}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-stone-400 italic text-center py-2">
              Select an option above to lock in your answer
            </div>
          )}
        </div>

        {/* Right Panel (4 cols): Live Standings Sidebar (Matches height of Left Panel) */}
        <div
          className={`lg:col-span-4 ${
            showMobileLeaderboard
              ? 'block fixed inset-x-0 bottom-0 z-40 bg-paper-50 dark:bg-paper-950 border-t border-stone-300 dark:border-stone-800 p-6 shadow-2xl rounded-t-2xl lg:relative lg:inset-auto lg:z-auto lg:border-t-0 lg:p-0 lg:shadow-none'
              : 'hidden lg:block'
          }`}
        >
          <div className="bg-paper-50/90 dark:bg-paper-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 lg:p-8 flex flex-col justify-between shadow-elevated backdrop-blur-md h-full min-h-[540px]">
            {/* Top: Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-accent" />
                  <h3 className="font-serif text-2xl font-normal text-paper-900 dark:text-paper-100">
                    Live Standings
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emeraldCustom font-bold bg-emeraldCustom/15 px-3 py-1 rounded-full border border-emeraldCustom/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emeraldCustom animate-ping"></span>
                  <span>Live</span>
                </div>
              </div>

              {/* Roster Items */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {sortedPlayers.map((player, rankIdx) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      player.isCurrentUser
                        ? 'border-accent/80 bg-accent/15 dark:bg-accent/20 shadow-subtle'
                        : 'border-stone-200/80 dark:border-stone-800/80 bg-paper-100/50 dark:bg-paper-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 font-serif font-bold text-center text-sm ${rankIdx === 0 ? 'text-accent text-base' : 'text-stone-500'}`}>
                        #{rankIdx + 1}
                      </span>

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold shrink-0 ${player.avatarBg}`}>
                        {player.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-paper-900 dark:text-paper-100">
                            {player.name}
                          </span>
                          {player.isCurrentUser && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-paper-950 font-bold">
                              You
                            </span>
                          )}
                          {player.streak > 1 && (
                            <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-bold" title={`${player.streak} Streak!`}>
                              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                          {player.title}
                        </span>
                      </div>
                    </div>

                    <span className="font-serif font-bold text-sm text-accent">
                      {player.score.toLocaleString()} <span className="text-[9px] text-stone-500 font-sans font-normal uppercase">pts</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Current User Status Footer */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">
                Your Current Rank
              </span>
              <span className="font-serif font-bold text-accent text-sm">
                #{currentUserRank} of {players.length} ({currentUser?.score.toLocaleString()} pts)
              </span>
            </div>

            {showMobileLeaderboard && (
              <button
                onClick={() => setShowMobileLeaderboard(false)}
                type="button"
                className="w-full mt-4 py-2.5 bg-stone-200 dark:bg-stone-800 text-xs font-bold uppercase tracking-wider rounded-xl text-paper-900 dark:text-paper-100 lg:hidden"
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
