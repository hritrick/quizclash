import React, { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';
import Lobby from './components/Lobby';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { MOCK_QUESTIONS } from './data/mockQuestions';
import { INITIAL_MOCK_PLAYERS } from './data/mockPlayers';

export default function App() {
  const [screen, setScreen] = useState('lobby'); // 'lobby' | 'quiz' | 'results'
  const [isDark, setIsDark] = useState(false);
  const [userName, setUserName] = useState('Hritik');
  const [roomCode] = useState('GK-8942');
  const [players, setPlayers] = useState(INITIAL_MOCK_PLAYERS);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleStartQuiz = () => {
    // Reset player scores & start quiz
    setPlayers(prev =>
      prev.map(p => ({
        ...p,
        score: 0,
        correctCount: 0,
        streak: 0,
        isReady: true
      }))
    );
    setCurrentQIndex(0);
    setUserAnswers([]);
    setScreen('quiz');
  };

  const handleAnswerSubmit = (answerData) => {
    setUserAnswers(prev => [...prev, answerData]);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setScreen('results');
    }
  };

  const handlePlayAgain = () => {
    setScreen('lobby');
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-paper-950 text-paper-900 dark:text-paper-100 font-sans transition-colors duration-300 relative flex flex-col justify-between">
      {/* Top Fixed Corner Theme Toggle */}
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {screen === 'lobby' && (
          <Lobby
            roomCode={roomCode}
            players={players}
            setPlayers={setPlayers}
            onStartQuiz={handleStartQuiz}
            userName={userName}
            setUserName={setUserName}
          />
        )}

        {screen === 'quiz' && (
          <Quiz
            questions={MOCK_QUESTIONS}
            currentQIndex={currentQIndex}
            onAnswerSubmit={handleAnswerSubmit}
            onNextQuestion={handleNextQuestion}
            players={players}
            setPlayers={setPlayers}
          />
        )}

        {screen === 'results' && (
          <Results
            players={players}
            totalQuestions={MOCK_QUESTIONS.length}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="py-6 border-t border-stone-200/60 dark:border-stone-800/60 text-center text-xs text-stone-500 dark:text-stone-500">
        <p className="font-serif italic">
          Chronicle Quiz • Experiment 1: Responsive & Interactive Tailwind CSS UI
        </p>
      </footer>
    </div>
  );
}
