import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import confetti from 'canvas-confetti';
import { Trophy, Award, Medal, RotateCcw, Home, Crown, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { resetGame } from '../features/game/gameSlice';
import { resetRoom } from '../features/room/roomSlice';

export const ResultsPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const game = useSelector((state) => state.game);
  const scoreboard = game.finalScoreboard || game.scoreboard || [];

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#F2A93B', '#FF5A4E', '#1F8A70', '#6C5CE7'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {}
  }, []);

  const handleReturnHome = () => {
    dispatch(resetGame());
    dispatch(resetRoom());
    navigate('/dashboard');
  };

  const top3 = scoreboard.slice(0, 3);
  const remainingPlayers = scoreboard.slice(3);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 flex flex-col items-center">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <Badge variant="amber" size="md" className="mb-3">
          Match Finished
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-ink-950 tracking-tight">
          Winner Takes The Crown!
        </h1>
        <p className="text-sm text-ink-700 mt-1">
          Final match standings calculated with speed bonus precision.
        </p>
      </div>

      {/* Podium Display for Top 3 */}
      {top3.length > 0 && (
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mb-12 px-2">
          {/* 2nd Place */}
          {top3[1] ? (
            <div className="flex flex-col items-center animate-slide-up">
              <Avatar seed={top3[1].avatarSeed || top3[1].username} size="lg" className="mb-2" />
              <span className="font-display font-bold text-xs sm:text-sm text-ink-900 text-center truncate max-w-full">
                {top3[1].username}
              </span>
              <span className="font-mono font-bold text-xs text-accent-coral mb-2">
                {top3[1].score} pts
              </span>
              <div className="w-full bg-cream-300 border-2 border-ink-900 h-28 sm:h-36 rounded-t-2xl flex flex-col items-center justify-start pt-3 shadow-[3px_3px_0px_0px_#14110F]">
                <Medal className="w-7 h-7 text-slate-500 mb-1" />
                <span className="font-display font-black text-xl text-ink-800">2nd</span>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* 1st Place (Winner) */}
          {top3[0] && (
            <div className="flex flex-col items-center animate-pop-in z-10">
              <div className="relative">
                <Crown className="w-8 h-8 text-accent-amber fill-accent-amber absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
                <Avatar
                  seed={top3[0].avatarSeed || top3[0].username}
                  size="xl"
                  className="mb-2 ring-4 ring-accent-amber"
                />
              </div>
              <span className="font-display font-black text-sm sm:text-base text-ink-950 text-center truncate max-w-full">
                {top3[0].username}
              </span>
              <span className="font-mono font-black text-sm text-accent-coral mb-2">
                {top3[0].score} pts
              </span>
              <div className="w-full bg-accent-amber border-2 border-ink-900 h-40 sm:h-48 rounded-t-2xl flex flex-col items-center justify-start pt-3 shadow-[4px_4px_0px_0px_#14110F]">
                <Trophy className="w-9 h-9 text-ink-950 mb-1" />
                <span className="font-display font-black text-2xl text-ink-950">1st</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] ? (
            <div className="flex flex-col items-center animate-slide-up">
              <Avatar seed={top3[2].avatarSeed || top3[2].username} size="lg" className="mb-2" />
              <span className="font-display font-bold text-xs sm:text-sm text-ink-900 text-center truncate max-w-full">
                {top3[2].username}
              </span>
              <span className="font-mono font-bold text-xs text-accent-coral mb-2">
                {top3[2].score} pts
              </span>
              <div className="w-full bg-amber-100 border-2 border-ink-900 h-20 sm:h-28 rounded-t-2xl flex flex-col items-center justify-start pt-3 shadow-[3px_3px_0px_0px_#14110F]">
                <Medal className="w-6 h-6 text-amber-700 mb-1" />
                <span className="font-display font-black text-lg text-ink-800">3rd</span>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Full Scoreboard Table Card */}
      <Card className="w-full max-w-2xl mb-8 shadow-[5px_5px_0px_0px_#14110F]">
        <h3 className="font-display font-bold text-lg text-ink-950 mb-4 pb-2 border-b-2 border-ink-900 flex items-center justify-between">
          <span>Final Standings</span>
          <span className="text-xs text-ink-600 font-mono">Room: {code}</span>
        </h3>

        <div className="space-y-2">
          {scoreboard.map((p, idx) => {
            const isMe = user && (user.id === p.userId || user._id === p.userId);
            return (
              <div
                key={p.userId || idx}
                className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                  isMe
                    ? 'bg-amber-50 border-accent-amber shadow-[2px_2px_0px_0px_#F2A93B]'
                    : 'bg-cream-100 border-ink-900 shadow-[2px_2px_0px_0px_#14110F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-display font-black text-base text-ink-700 text-center">
                    #{p.rank || idx + 1}
                  </span>
                  <Avatar seed={p.avatarSeed || p.username} size="sm" />
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-sm text-ink-950 flex items-center gap-1.5">
                      {p.username}
                      {isMe && (
                        <span className="text-[9px] bg-ink-900 text-cream-50 px-1 py-0.2 rounded font-mono font-bold">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-ink-600 font-mono">
                      {p.correctCount !== undefined ? `🎯 ${p.correctCount} Correct` : ''}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-black text-base sm:text-lg text-accent-coral">
                  {p.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Navigation CTA */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="primary" size="lg" onClick={handleReturnHome}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Another Quiz
        </Button>
        <Link to="/leaderboard">
          <Button variant="secondary" size="lg">
            <Trophy className="w-5 h-5 mr-2 text-accent-amber" />
            Global Rankings
          </Button>
        </Link>
      </div>
    </div>
  );
};
