import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  Copy,
  Check,
  Play,
  Eye,
  Crown,
  Share2,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQuizSocket } from '../hooks/useQuizSocket';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

export const LobbyPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);

  const room = useSelector((state) => state.room);
  const game = useSelector((state) => state.game);

  const { startGame } = useQuizSocket(code, isSpectatorMode);

  // If game transitions to in_progress, redirect to /game/:code
  useEffect(() => {
    if (room.roomCode === code && room.status === 'in_progress') {
      navigate(`/game/${code}`);
    }
  }, [room.status, room.roomCode, code, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/lobby/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = room.hostId && user && (room.hostId === user.id || room.hostId === user._id);
  const players = room.players || [];

  if (room.error) return <ErrorState message={room.error} onRetry={() => window.location.reload()} />;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-3 xs:px-4 lg:px-8 py-4 sm:py-8">
      {/* Back to Dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-ink-700 hover:text-ink-950 mb-4 sm:mb-6 bg-cream-100 px-3 py-1.5 rounded-xl border border-ink-900 shadow-[2px_2px_0px_0px_#14110F]"
      >
        <ArrowLeft className="w-4 h-4" />
        Leave Lobby
      </button>

      {/* Asymmetric 2-Column Grid: Left Main Match Info, Right Connected Players Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Match Details, Invite Code & Host Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
          {/* Big Room Code Header Card */}
          <div className="bg-ink-900 border-2 xs:border-3 border-ink-950 rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-[4px_4px_0px_0px_#F2A93B] xs:shadow-[6px_6px_0px_0px_#F2A93B] text-cream-50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Badge variant="amber" size="xs">Match Lobby</Badge>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-cream-300/80 uppercase tracking-widest block mb-1">
              {room.quiz?.category || 'General Knowledge'}
            </span>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-display font-black text-cream-100 mb-4 sm:mb-6 break-words leading-tight">
              {room.quiz?.title || 'Multiplayer Showdown'}
            </h1>

            {/* Room Code Display with Copy Button */}
            <div className="bg-ink-950 border-2 border-ink-700 rounded-xl xs:rounded-2xl p-4 xs:p-5 mb-4 sm:mb-6 flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-4">
              <div className="flex flex-col text-center xs:text-left">
                <span className="text-[10px] xs:text-[11px] font-bold uppercase tracking-widest text-ink-400">
                  Room Invite Code
                </span>
                <span className="font-mono text-3xl xs:text-4xl sm:text-5xl font-black text-accent-amber tracking-widest">
                  {code}
                </span>
              </div>

              <div className="flex gap-2 w-full xs:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCopyCode}
                  className="flex-1 xs:flex-none text-xs xs:text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-ink-950" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleShareLink}
                  className="px-3"
                  title="Copy Full Invite URL"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Host Controls or Waiting State */}
            {isHost ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-ink-800">
                <div className="flex items-center gap-2 text-xs font-bold text-accent-amber self-start sm:self-auto">
                  <Crown className="w-4 h-4 shrink-0" />
                  <span>You are the Quiz Master (Host)</span>
                </div>
                <Button
                  variant="coral"
                  size="lg"
                  onClick={startGame}
                  className="w-full sm:w-auto font-black shadow-[4px_4px_0px_0px_#B22222]"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Start Match Now
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 xs:p-4 bg-ink-800/80 rounded-xl border border-ink-700">
                <div className="w-3 h-3 rounded-full bg-accent-amber animate-bounce shrink-0" />
                <span className="text-xs xs:text-sm font-display font-bold text-cream-200">
                  Waiting for host to kick off the game... Get ready!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Player List & Spectators Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-cream-50 border-2 border-ink-900 rounded-2xl xs:rounded-3xl p-4 xs:p-6 shadow-[4px_4px_0px_0px_#14110F] xs:shadow-[5px_5px_0px_0px_#14110F]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-ink-900">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-5 h-5 text-accent-coral shrink-0" />
                <h3 className="font-display font-extrabold text-lg xs:text-xl text-ink-950 truncate">
                  Challengers ({players.length})
                </h3>
              </div>
              <Badge variant="teal" size="xs">
                Ready
              </Badge>
            </div>

            {players.length === 0 ? (
              <div className="p-6 xs:p-8 text-center bg-cream-100/50 rounded-2xl border-2 border-dashed border-ink-400">
                <Avatar seed="empty_room" size="lg" className="mx-auto mb-3" />
                <h4 className="font-display font-bold text-ink-900 text-sm mb-1">
                  No one's here yet!
                </h4>
                <p className="text-xs text-ink-600">
                  Share code <span className="font-mono font-bold text-accent-coral">{code}</span> to summon your rivals.
                </p>
              </div>
            ) : (
              <div className="space-y-2 xs:space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {players.map((p, idx) => {
                  const isPlayerHost =
                    room.hostId && (room.hostId === p.userId || room.hostId === p.userId?._id);
                  const isMe = user && (user.id === p.userId || user._id === p.userId);

                  return (
                    <div
                      key={p.userId || idx}
                      className={`flex items-center justify-between p-2.5 xs:p-3 rounded-xl xs:rounded-2xl border-2 transition-all gap-2 ${
                        isMe
                          ? 'bg-amber-50 border-accent-amber shadow-[2px_2px_0px_0px_#F2A93B] xs:shadow-[3px_3px_0px_0px_#F2A93B]'
                          : 'bg-cream-100 border-ink-900 shadow-[2px_2px_0px_0px_#14110F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 xs:gap-3 min-w-0">
                        <Avatar seed={p.avatarSeed || p.username} size="sm" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-display font-bold text-xs xs:text-sm text-ink-950 flex items-center gap-1.5">
                            <span className="truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px]">
                              {p.username}
                            </span>
                            {isMe && (
                              <span className="text-[9px] xs:text-[10px] bg-ink-900 text-cream-50 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                                YOU
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] xs:text-[10px] text-ink-600 font-mono">
                            {p.connected !== false ? '🟢 Connected' : '🔴 Reconnecting...'}
                          </span>
                        </div>
                      </div>

                      {isPlayerHost && (
                        <span className="inline-flex items-center gap-1 text-[10px] xs:text-[11px] font-bold text-accent-coral bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300 shrink-0">
                          <Crown className="w-3 h-3" /> Host
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
