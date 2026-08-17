import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Trophy, Flame, ChevronRight, Volume2, VolumeX, Users, AlertCircle } from 'lucide-react';

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
          // Auto submit timeout if not answered
          if (!isAnswered) {
            handleOptionClick(-1, true); // Timeout
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
          // Random chance for other players to score points based on speed
          const randomIncrement = Math.random() > 0.4 ? Math.floor(Math.random() * 80) + 20 : 0;
          return {
            ...player,
            score: player.score + randomIncrement,
            streak: randomIncrement > 0 ? player.streak + 1 : 0
          };
        })
      );
    }, 3500);

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

  const timerPercentage = (timeLeft / 15) * 100;
  const isTimeCritical = timeLeft <= 4 && !isAnswered;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 animate-fade-slide">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded bg-accent/15 text-accent font-semibold border border-accent/20">
            {currentQuestion.category}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            {currentQuestion.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded text-stone-500 hover:text-accent transition-colors cursor-pointer"
            title={soundEnabled ? "Mute Timer Sounds" : "Enable Sound Effects"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mobile Leaderboard Drawer Trigger */}
          <button
            onClick={() => setShowMobileLeaderboard(!showMobileLeaderboard)}
            type="button"
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-300 dark:border-stone-800 text-xs uppercase tracking-wider text-paper-800 dark:text-paper-200 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span>Rank #{currentUserRank}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Quiz Canvas & Live Leaderboard Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Quiz Question & Options */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Header & Timer Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span className="uppercase tracking-wider">
                Question <strong className="text-paper-900 dark:text-paper-100 font-serif text-sm">{currentQIndex + 1}</strong> of {questions.length}
              </span>

              <div className="flex items-center gap-1.5 font-mono">
                <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-accent'}`} />
                <span className={`text-sm font-semibold ${isTimeCritical ? 'text-rose-500' : 'text-paper-900 dark:text-paper-100'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  isTimeCritical
                    ? 'bg-rose-500'
                    : 'bg-accent'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>

          {/* Question Text Box */}
          <div className="py-6 sm:py-8 border-b border-stone-200 dark:border-stone-800">
            <h2 className="font-serif text-2xl sm:text-4xl font-normal leading-tight text-paper-900 dark:text-paper-50 tracking-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 4 Answer Options */}
          <div className="grid grid-cols-1 gap-3.5">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQuestion.correctAnswer;
              
              let optionStyle = "border-stone-200 dark:border-stone-800 bg-paper-50 dark:bg-paper-950 text-paper-900 dark:text-paper-100 hover:border-accent/70 hover:bg-paper-100/50 dark:hover:bg-paper-900/50";
              
              if (isAnswered) {
                if (isCorrectAnswer) {
                  optionStyle = "border-emeraldCustom bg-emeraldCustom/10 text-emerald-900 dark:text-emerald-200 shadow-sm";
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = "border-crimson bg-crimson/10 text-crimson-dark dark:text-crimson-light";
                } else {
                  optionStyle = "border-stone-200/50 dark:border-stone-800/40 opacity-50 bg-paper-50/50 dark:bg-paper-950/50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  type="button"
                  className={`w-full p-4 sm:p-5 rounded-lg border text-left transition-all duration-200 flex items-center justify-between group cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-serif text-sm font-semibold shrink-0 transition-colors ${
                        isAnswered && isCorrectAnswer
                          ? 'bg-emeraldCustom text-paper-50'
                          : isAnswered && isSelected && !isCorrectAnswer
                          ? 'bg-crimson text-paper-50'
                          : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 group-hover:bg-accent group-hover:text-paper-950'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-normal leading-snug">
                      {option}
                    </span>
                  </div>

                  {/* Feedback Status Icon */}
                  {isAnswered && (
                    <div className="shrink-0 ml-3">
                      {isCorrectAnswer && <Check className="w-5 h-5 text-emeraldCustom" />}
                      {isSelected && !isCorrectAnswer && <X className="w-5 h-5 text-crimson" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Answer Lock */}
          {isAnswered && (
            <div className="p-4 sm:p-5 rounded-lg border border-stone-300 dark:border-stone-800 bg-paper-100/60 dark:bg-paper-900/60 animate-fade-slide space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                <AlertCircle className="w-4 h-4 text-accent" />
                <span>Historical Context</span>
              </div>
              <p className="font-serif italic text-base text-paper-800 dark:text-paper-200 leading-relaxed">
                {currentQuestion.explanation}
              </p>
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onNextQuestion}
                  type="button"
                  className="px-6 py-2.5 rounded bg-accent hover:bg-accent-hover text-paper-950 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-subtle"
                >
                  <span>{currentQIndex < questions.length - 1 ? 'Next Question' : 'View Final Podium'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Live Multiplayer Leaderboard */}
        <div className={`lg:col-span-4 ${showMobileLeaderboard ? 'block fixed inset-x-0 bottom-0 z-40 bg-paper-50 dark:bg-paper-950 border-t border-stone-300 dark:border-stone-800 p-6 shadow-2xl rounded-t-2xl lg:relative lg:inset-auto lg:z-auto lg:border-t-0 lg:p-0 lg:shadow-none' : 'hidden lg:block'}`}>
          <div className="sticky top-20 p-5 rounded-lg border border-stone-200 dark:border-stone-800 bg-paper-100/40 dark:bg-paper-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-lg font-normal text-paper-900 dark:text-paper-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span>Live Leaderboard</span>
              </h3>

              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emeraldCustom font-semibold bg-emeraldCustom/10 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emeraldCustom animate-ping"></span>
                <span>Live Feed</span>
              </div>
            </div>

            {/* Players Ranking List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {sortedPlayers.map((player, rankIdx) => (
                <div
                  key={player.id}
                  className={`p-3 rounded border transition-all flex items-center justify-between ${
                    player.isCurrentUser
                      ? 'border-accent/80 bg-accent/10 shadow-subtle'
                      : 'border-stone-200/80 dark:border-stone-800/80 bg-paper-50 dark:bg-paper-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 font-serif font-bold text-center text-sm ${rankIdx === 0 ? 'text-accent' : 'text-stone-500'}`}>
                      #{rankIdx + 1}
                    </span>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-bold ${player.avatarBg}`}>
                      {player.initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-paper-900 dark:text-paper-100">
                          {player.name}
                        </span>
                        {player.streak > 1 && (
                          <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-semibold" title={`${player.streak} Streak!`}>
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="font-serif font-bold text-sm text-accent">
                    {player.score.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>

            {showMobileLeaderboard && (
              <button
                onClick={() => setShowMobileLeaderboard(false)}
                className="w-full mt-4 py-2 bg-stone-200 dark:bg-stone-800 text-xs font-semibold uppercase tracking-wider rounded text-paper-800 dark:text-paper-200 lg:hidden"
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
