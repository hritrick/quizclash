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
import { useQuizSocket } from '../hooks/useQuizSocket';

export const ResultsPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  useQuizSocket(code);

  const game = useSelector((state) => state.game);
  const scoreboard = game.finalScoreboard.length ? game.finalScoreboard : game.scoreboard;

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
    <div className="flex-1 max-w-5xl mx-auto w-full px-3 xs:px-4 lg:px-8 py-4 sm:py-8 flex flex-col items-center">
      {/* Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <Badge variant="amber" size="md" className="mb-2 sm:mb-3">
          Match Finished
        </Badge>
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-display font-black text-ink-950 tracking-tight">
          Winner Takes The Crown!
        </h1>
        <p className="text-xs xs:text-sm text-ink-700 mt-1">
          Final match standings calculated with speed bonus precision.
        </p>
      </div>

      {/* Podium Display for Top 3 */}
      {top3.length > 0 && (
        <div className="w-full grid grid-cols-3 gap-1.5 xs:gap-3 sm:gap-6 items-end max-w-2xl mb-8 sm:mb-12 px-1 xs:px-2">
          {/* 2nd Place */}
          {top3[1] ? (
            <div className="flex flex-col items-center animate-slide-up min-w-0">
              <Avatar seed={top3[1].avatarSeed || top3[1].username} size="md" className="mb-1 sm:mb-2 xs:hidden" />
              <Avatar seed={top3[1].avatarSeed || top3[1].username} size="lg" className="mb-1 sm:mb-2 hidden xs:inline-flex" />
              <span className="font-display font-bold text-[11px] xs:text-xs sm:text-sm text-ink-900 text-center truncate max-w-full block px-0.5">
                {top3[1].username}
              </span>
              <span className="font-mono font-bold text-[10px] xs:text-xs text-accent-coral mb-1.5 xs:mb-2">
                {top3[1].score} pts
              </span>
              <div className="w-full bg-cream-300 border-2 border-ink-900 h-20 xs:h-28 sm:h-36 rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-start pt-2 sm:pt-3 shadow-[2px_2px_0px_0px_#14110F] sm:shadow-[3px_3px_0px_0px_#14110F]">
                <Medal className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 mb-0.5 sm:mb-1" />
                <span className="font-display font-black text-base sm:text-xl text-ink-800">2nd</span>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* 1st Place (Winner) */}
          {top3[0] && (
            <div className="flex flex-col items-center animate-pop-in z-10 min-w-0">
              <div className="relative">
                <Crown className="w-5 h-5 xs:w-8 xs:h-8 text-accent-amber fill-accent-amber absolute -top-4 xs:-top-6 left-1/2 -translate-x-1/2 animate-bounce" />
                <Avatar
                  seed={top3[0].avatarSeed || top3[0].username}
                  size="lg"
                  className="mb-1 sm:mb-2 ring-3 sm:ring-4 ring-accent-amber xs:hidden"
                />
                <Avatar
                  seed={top3[0].avatarSeed || top3[0].username}
                  size="xl"
                  className="mb-1 sm:mb-2 ring-3 sm:ring-4 ring-accent-amber hidden xs:inline-flex"
                />
              </div>
              <span className="font-display font-black text-xs xs:text-sm sm:text-base text-ink-950 text-center truncate max-w-full block px-0.5">
                {top3[0].username}
              </span>
              <span className="font-mono font-black text-xs xs:text-sm text-accent-coral mb-1.5 xs:mb-2">
                {top3[0].score} pts
              </span>
              <div className="w-full bg-accent-amber border-2 border-ink-900 h-28 xs:h-40 sm:h-48 rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-start pt-2 sm:pt-3 shadow-[3px_3px_0px_0px_#14110F] sm:shadow-[4px_4px_0px_0px_#14110F]">
                <Trophy className="w-6 h-6 sm:w-9 sm:h-9 text-ink-950 mb-0.5 sm:mb-1" />
                <span className="font-display font-black text-lg sm:text-2xl text-ink-950">1st</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] ? (
            <div className="flex flex-col items-center animate-slide-up min-w-0">
              <Avatar seed={top3[2].avatarSeed || top3[2].username} size="md" className="mb-1 sm:mb-2 xs:hidden" />
              <Avatar seed={top3[2].avatarSeed || top3[2].username} size="lg" className="mb-1 sm:mb-2 hidden xs:inline-flex" />
              <span className="font-display font-bold text-[11px] xs:text-xs sm:text-sm text-ink-900 text-center truncate max-w-full block px-0.5">
                {top3[2].username}
              </span>
              <span className="font-mono font-bold text-[10px] xs:text-xs text-accent-coral mb-1.5 xs:mb-2">
                {top3[2].score} pts
              </span>
              <div className="w-full bg-amber-100 border-2 border-ink-900 h-16 xs:h-20 sm:h-28 rounded-t-xl sm:rounded-t-2xl flex flex-col items-center justify-start pt-2 sm:pt-3 shadow-[2px_2px_0px_0px_#14110F] sm:shadow-[3px_3px_0px_0px_#14110F]">
                <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 mb-0.5 sm:mb-1" />
                <span className="font-display font-black text-sm sm:text-lg text-ink-800">3rd</span>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Full Scoreboard Table Card */}
      <Card className="w-full max-w-2xl mb-6 sm:mb-8 shadow-[4px_4px_0px_0px_#14110F] xs:shadow-[5px_5px_0px_0px_#14110F] p-3.5 xs:p-5">
        <h3 className="font-display font-bold text-base xs:text-lg text-ink-950 mb-3 xs:mb-4 pb-2 border-b-2 border-ink-900 flex items-center justify-between">
          <span>Final Standings</span>
          <span className="text-xs text-ink-600 font-mono">Room: {code}</span>
        </h3>

        <div className="space-y-2">
          {scoreboard.map((p, idx) => {
            const isMe = user && (user.id === p.userId || user._id === p.userId);
            return (
              <div
                key={p.userId || idx}
                className={`flex items-center justify-between p-2.5 xs:p-3 rounded-xl border-2 gap-2 ${
                  isMe
                    ? 'bg-amber-50 border-accent-amber shadow-[2px_2px_0px_0px_#F2A93B]'
                    : 'bg-cream-100 border-ink-900 shadow-[2px_2px_0px_0px_#14110F]'
                }`}
              >
                <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                  <span className="w-5 xs:w-6 font-display font-black text-sm xs:text-base text-ink-700 text-center shrink-0">
                    #{p.rank || idx + 1}
                  </span>
                  <Avatar seed={p.avatarSeed || p.username} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-display font-bold text-xs xs:text-sm text-ink-950 flex items-center gap-1.5">
                      <span className="truncate max-w-[85px] xs:max-w-[150px] sm:max-w-none">
                        {p.username}
                      </span>
                      {isMe && (
                        <span className="text-[8px] xs:text-[9px] bg-ink-900 text-cream-50 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] xs:text-[10px] text-ink-600 font-mono truncate">
                      {p.correctCount !== undefined ? `🎯 ${p.correctCount} Correct` : ''}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-black text-sm xs:text-base sm:text-lg text-accent-coral whitespace-nowrap shrink-0">
                  {p.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Navigation CTA */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
        <Button variant="primary" size="lg" onClick={handleReturnHome} className="w-full xs:w-auto">
          <RotateCcw className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
          Play Another Quiz
        </Button>
        <Link to="/leaderboard" className="w-full xs:w-auto">
          <Button variant="secondary" size="lg" className="w-full xs:w-auto">
            <Trophy className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-accent-amber" />
            Global Rankings
          </Button>
        </Link>
      </div>
    </div>
  );
};
