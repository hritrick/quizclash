import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Trophy,
  PlusCircle,
  BarChart3,
  LogOut,
  Volume2,
  VolumeX,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { sounds } from '../../lib/sound';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [muted, setMuted] = useState(sounds.muted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/auth');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b-2 border-ink-900 px-3 xs:px-4 lg:px-8 py-2.5 xs:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 xs:gap-4">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 xs:gap-2.5 group">
          <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl bg-accent-amber border-2 border-ink-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#14110F] group-hover:scale-105 transition-transform shrink-0">
            <Zap className="w-4 h-4 xs:w-6 xs:h-6 text-ink-950 fill-ink-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl xs:text-2xl tracking-tighter text-ink-950 leading-none">
              Quiz<span className="text-accent-coral">Clash</span>
            </span>
            <span className="text-[9px] xs:text-[10px] font-bold tracking-widest uppercase text-ink-600">
              Live Pub Trivia
            </span>
          </div>
        </Link>

        {/* Center Nav Links - Desktop Only (md and up) */}
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

        {/* Right Section: Sound toggle + User Info / Auth CTA + Mobile Hamburger Toggle */}
        <div className="flex items-center gap-1.5 xs:gap-3">
          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 xs:p-2 rounded-xl border-2 border-ink-900 bg-cream-50 hover:bg-cream-300 text-ink-800 shadow-[2px_2px_0px_0px_#14110F] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title={muted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Toggle Sound"
          >
            {muted ? (
              <VolumeX className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-ink-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-accent-amber fill-accent-amber/30" />
            )}
          </button>

          {/* Desktop User Info & Auth */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2 xs:gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-cream-50 hover:bg-cream-300 rounded-2xl border-2 border-ink-900 shadow-[2px_2px_0px_0px_#14110F] transition-all max-w-[170px]"
              >
                <Avatar seed={user.avatarSeed || user.username} size="sm" showBorder={false} />
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-display font-bold text-xs text-ink-950 leading-tight truncate">
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
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/auth">
                <Button variant="primary" size="sm">
                  Sign In / Play
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button (visible only below md) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 xs:p-2 rounded-xl border-2 border-ink-900 bg-cream-50 hover:bg-cream-300 text-ink-950 shadow-[2px_2px_0px_0px_#14110F] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-ink-950" />
            ) : (
              <Menu className="w-5 h-5 text-ink-950" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Drawer below md */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t-2 border-ink-900/20 flex flex-col gap-2 font-display font-bold animate-slide-up">
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-ink-900 bg-cream-50 hover:bg-cream-300 border border-ink-900/30 text-sm"
          >
            <Sparkles className="w-4 h-4 text-accent-amber" />
            Play & Browse
          </Link>
          <Link
            to="/leaderboard"
            onClick={closeMenu}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-ink-900 bg-cream-50 hover:bg-cream-300 border border-ink-900/30 text-sm"
          >
            <Trophy className="w-4 h-4 text-accent-amber" />
            Leaderboard
          </Link>
          {isAuthenticated && (user?.role === 'host' || user?.role === 'admin') && (
            <Link
              to="/host/builder"
              onClick={closeMenu}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-ink-900 bg-cream-50 hover:bg-cream-300 border border-ink-900/30 text-sm"
            >
              <PlusCircle className="w-4 h-4 text-accent-teal" />
              Host Builder
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/analytics"
              onClick={closeMenu}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-ink-900 bg-cream-50 hover:bg-cream-300 border border-ink-900/30 text-sm"
            >
              <BarChart3 className="w-4 h-4 text-accent-violet" />
              Admin Analytics
            </Link>
          )}

          {/* User profile section in mobile menu */}
          <div className="pt-2 mt-1 border-t border-ink-900/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-2.5 bg-cream-200 rounded-xl border border-ink-900/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar seed={user.avatarSeed || user.username} size="sm" />
                    <div className="flex flex-col text-left min-w-0">
                      <span className="font-bold text-xs text-ink-950 truncate">
                        {user.username}
                      </span>
                      <span className="text-[10px] text-accent-coral font-mono">
                        {user.stats?.totalScore || 0} pts
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-700 bg-cream-50 px-2 py-1 rounded-lg border border-ink-400">
                    View Profile
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-ink-900 text-rose-950 text-xs font-bold shadow-[2px_2px_0px_0px_#14110F]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={closeMenu} className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  Sign In / Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
