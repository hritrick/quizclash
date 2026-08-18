import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Users, Trophy, Play, Sparkles, Flame, Snowflake, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      navigate(`/lobby/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section with Asymmetric Layout */}
      <section className="relative pt-12 pb-16 px-4 lg:px-8 border-b-2 border-ink-900 bg-gradient-to-b from-cream-100 to-cream-200 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Game Show Title + Fast Join */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="amber" size="sm">
                <Sparkles className="w-3.5 h-3.5" />
                Live Multiplayer Pub Quiz
              </Badge>
              <Badge variant="teal" size="sm">
                Zero Generic Gradients
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink-950 font-display tracking-tight leading-[1.05] mb-6">
              Outsmart your rivals.{' '}
              <span className="relative inline-block text-accent-coral underline decoration-wavy decoration-accent-amber decoration-4">
                Claim the crown.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-ink-700 max-w-xl font-medium mb-8">
              High-octane, real-time pub quiz battles with tactile buzzers, server-authoritative speed
              scoring, and dirty tactical power-ups.
            </p>

            {/* Quick Action Box: Join Code Form */}
            <div className="w-full max-w-lg bg-cream-50 border-2 border-ink-900 p-5 rounded-2xl shadow-[6px_6px_0px_0px_#14110F] mb-6">
              <span className="block font-display font-bold text-sm text-ink-900 mb-2">
                Have a 6-letter room code? Jump right in:
              </span>
              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CLASH7"
                  className="flex-1 bg-cream-100 border-2 border-ink-900 rounded-xl px-4 py-3 font-mono font-bold text-lg text-ink-950 uppercase tracking-widest placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
                <Button type="submit" variant="primary" size="md" disabled={joinCode.length !== 6}>
                  <Play className="w-4 h-4 mr-1.5 fill-current" />
                  Join Room
                </Button>
              </form>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/dashboard">
                <Button variant="coral" size="lg">
                  Browse Quizzes & Solo Mode
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="secondary" size="lg">
                  <Trophy className="w-5 h-5 mr-2 text-accent-amber" />
                  View Leaderboards
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Game Show Interactive Buzzer Preview Board */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-ink-900 border-3 border-ink-950 p-6 rounded-3xl shadow-[8px_8px_0px_0px_#F2A93B] text-cream-50 relative animate-pop-in">
              {/* Game Card Header */}
              <div className="flex items-center justify-between border-b border-ink-700 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-xs font-bold text-accent-amber uppercase tracking-wider">
                    Question 4 / 5
                  </span>
                </div>
                <span className="font-mono text-xs font-bold bg-ink-800 px-2.5 py-1 rounded-md border border-ink-700 text-cream-100">
                  ⏱️ 09s Left
                </span>
              </div>

              {/* Sample Question */}
              <h3 className="font-display font-bold text-lg text-cream-100 mb-6 leading-snug">
                Which planet in our solar system boasts the most extensive ring system?
              </h3>

              {/* 2x2 Buzzer Tiles Preview */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 bg-tile-red text-white font-display font-bold text-sm rounded-xl border-2 border-ink-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-mono">▲</span>
                  Jupiter
                </div>
                <div className="p-3.5 bg-accent-teal text-white font-display font-bold text-sm rounded-xl border-2 border-ink-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] ring-2 ring-accent-amber">
                  <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-mono">◆</span>
                  Saturn ✨
                </div>
                <div className="p-3.5 bg-accent-amber text-ink-950 font-display font-bold text-sm rounded-xl border-2 border-ink-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-mono">●</span>
                  Uranus
                </div>
                <div className="p-3.5 bg-tile-violet text-white font-display font-bold text-sm rounded-xl border-2 border-ink-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-mono">■</span>
                  Neptune
                </div>
              </div>

              {/* Tactical Power-ups Bar Preview */}
              <div className="flex items-center justify-between bg-ink-800/80 p-2.5 rounded-xl border border-ink-700">
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wide">Power-ups</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-accent-amber border border-amber-500/40">50:50</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-accent-coral border border-rose-500/40">2x Multiplier</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">❄️ Freeze</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <Badge variant="coral" size="sm" className="mb-3">
            Why QuizClash Hits Different
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-ink-950">
            Engineered for Competitive Pub Quiz Nights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-accent-amber/20 border-2 border-ink-900 flex items-center justify-center text-ink-900 mb-4 shadow-[2px_2px_0px_0px_#14110F]">
              <Zap className="w-6 h-6 text-accent-amber fill-accent-amber" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-950 mb-2">
              Time-Decay Speed Scoring
            </h3>
            <p className="text-sm text-ink-700">
              The faster you buzz in with the right answer, the more points you bank. Sub-second reflexes
              separate trivia champions from the rest.
            </p>
          </Card>

          <Card hover className="flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-accent-coral/20 border-2 border-ink-900 flex items-center justify-center text-ink-900 mb-4 shadow-[2px_2px_0px_0px_#14110F]">
              <Snowflake className="w-6 h-6 text-accent-coral" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-950 mb-2">
              Tactical Power-Up Sabotage
            </h3>
            <p className="text-sm text-ink-700">
              Cut out bad choices with 50:50, double your score with 2x Multiplier, or freeze your top rival’s
              buzzers for 4 crucial seconds.
            </p>
          </Card>

          <Card hover className="flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-accent-teal/20 border-2 border-ink-900 flex items-center justify-center text-ink-900 mb-4 shadow-[2px_2px_0px_0px_#14110F]">
              <Users className="w-6 h-6 text-accent-teal" />
            </div>
            <h3 className="text-xl font-display font-bold text-ink-950 mb-2">
              Spectator & Solo Modes
            </h3>
            <p className="text-sm text-ink-700">
              Jump into live matches as an audience member to watch the drama unfold, or practice solo to
              sharpen your knowledge across 8 distinct categories.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
