import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Trophy, PlusCircle, BarChart3, LogOut, Volume2, VolumeX, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { sounds } from '../../lib/sound';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(sounds.muted);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b-2 border-ink-900 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-accent-amber border-2 border-ink-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#14110F] group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 text-ink-950 fill-ink-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-tighter text-ink-950 leading-none">
              Quiz<span className="text-accent-coral">Clash</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-ink-600">
              Live Pub Trivia
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 font-display font-bold text-sm">
          <Link
            to="/dashboard"
            className="px-3 py-1.5 rounded-lg text-ink-800 hover:text-ink-950 hover:bg-cream-300 transition-colors"
          >
            Play & Browse
          </Link>
          <Link
            to="/leaderboard"
            className="px-3 py-1.5 rounded-lg text-ink-800 hover:text-ink-950 hover:bg-cream-300 transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-accent-amber" />
            Leaderboard
          </Link>
          {isAuthenticated && (user?.role === 'host' || user?.role === 'admin') && (
            <Link
              to="/host/builder"
              className="px-3 py-1.5 rounded-lg text-ink-800 hover:text-ink-950 hover:bg-cream-300 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-accent-teal" />
              Host Builder
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/analytics"
              className="px-3 py-1.5 rounded-lg text-ink-800 hover:text-ink-950 hover:bg-cream-300 transition-colors flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4 text-accent-violet" />
              Analytics
            </Link>
          )}
        </nav>

        {/* Right Section: Sound toggle + User Info / Auth CTA */}
        <div className="flex items-center gap-3">
          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl border-2 border-ink-900 bg-cream-50 hover:bg-cream-300 text-ink-800 shadow-[2px_2px_0px_0px_#14110F] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title={muted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-ink-500" /> : <Volume2 className="w-4 h-4 text-accent-amber fill-accent-amber/30" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-cream-50 hover:bg-cream-300 rounded-2xl border-2 border-ink-900 shadow-[2px_2px_0px_0px_#14110F] transition-all"
              >
                <Avatar seed={user.avatarSeed || user.username} size="sm" showBorder={false} />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-display font-bold text-xs text-ink-950 leading-tight">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-accent-coral font-bold font-mono">
                    {user.stats?.totalScore || 0} pts
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border-2 border-ink-900 bg-rose-100 hover:bg-rose-200 text-rose-900 shadow-[2px_2px_0px_0px_#14110F] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="primary" size="sm">
                  Sign In / Play
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
