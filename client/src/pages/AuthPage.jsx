import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Sparkles, User, Mail, Lock, ShieldCheck, Dice5 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'player',
    avatarSeed: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const randomizeAvatar = () => {
    const seed = 'quiz_' + Math.random().toString(36).substring(2, 9);
    setFormData((prev) => ({ ...prev, avatarSeed: seed }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          avatarSeed: formData.avatarSeed || formData.username,
        });
      } else {
        await login(formData.email, formData.password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details?.[0]?.message ||
        err.message ||
        'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-accent-amber border-2 border-ink-900 items-center justify-center shadow-[3px_3px_0px_0px_#14110F] mb-3">
            <Zap className="w-6 h-6 text-ink-950 fill-current" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-ink-950">
            {isRegister ? 'Join the Quiz Arena' : 'Welcome Back, Trivia Warrior'}
          </h2>
          <p className="text-sm text-ink-700 mt-1">
            {isRegister
              ? 'Claim your handle, roll an avatar, and start buzzing.'
              : 'Enter your credentials to access live matches and stats.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-cream-300 p-1 border-2 border-ink-900 mb-6 shadow-[3px_3px_0px_0px_#14110F]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 font-display font-bold text-sm rounded-lg transition-all ${
              !isRegister
                ? 'bg-ink-900 text-cream-50 shadow-sm'
                : 'text-ink-800 hover:text-ink-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 font-display font-bold text-sm rounded-lg transition-all ${
              isRegister
                ? 'bg-ink-900 text-cream-50 shadow-sm'
                : 'text-ink-800 hover:text-ink-950'
            }`}
          >
            Register
          </button>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-[6px_6px_0px_0px_#14110F]">
          {error && (
            <div className="mb-4 p-3 bg-rose-100 border-2 border-rose-900/30 rounded-xl text-rose-900 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Avatar Preview & Randomizer */}
                <div className="flex items-center gap-4 p-3 bg-cream-100 rounded-xl border-2 border-ink-900/40">
                  <Avatar
                    seed={formData.avatarSeed || formData.username || 'quizzer'}
                    size="lg"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-display font-bold text-ink-800">
                      Player Identity
                    </span>
                    <button
                      type="button"
                      onClick={randomizeAvatar}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream-50 hover:bg-cream-300 border-2 border-ink-900 rounded-lg text-xs font-display font-bold shadow-[2px_2px_0px_0px_#14110F] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Dice5 className="w-3.5 h-3.5" />
                      Reroll Avatar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                    Handle / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="e.g. MasterMind99"
                      className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl pl-9 pr-4 py-2.5 font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-accent-amber"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@domain.com"
                  className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl pl-9 pr-4 py-2.5 font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl pl-9 pr-4 py-2.5 font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-accent-amber"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'player' })}
                    className={`py-2 px-3 rounded-xl border-2 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.role === 'player'
                        ? 'bg-accent-amber border-ink-900 shadow-[2px_2px_0px_0px_#14110F] text-ink-950'
                        : 'bg-cream-100 border-ink-600/40 text-ink-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Player (Competitor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'host' })}
                    className={`py-2 px-3 rounded-xl border-2 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.role === 'host'
                        ? 'bg-accent-coral border-ink-900 shadow-[2px_2px_0px_0px_#14110F] text-white'
                        : 'bg-cream-100 border-ink-600/40 text-ink-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Host / Quiz Master
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant={isRegister ? 'coral' : 'primary'}
              size="lg"
              isLoading={loading}
              className="w-full mt-4"
            >
              {isRegister ? 'Create Account & Play' : 'Enter Arena'}
            </Button>
          </form>

          {/* Seed accounts helper for quick evaluation */}
          <div className="mt-6 pt-4 border-t border-ink-300 text-center">
            <span className="text-[11px] font-bold text-ink-600 uppercase tracking-wider block mb-1">
              Demo Credentials
            </span>
            <div className="flex flex-wrap justify-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'admin@quizclash.com', password: 'password123' });
                  setIsRegister(false);
                }}
                className="underline hover:text-accent-coral"
              >
                Admin (admin@quizclash.com)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'alex@quizclash.com', password: 'password123' });
                  setIsRegister(false);
                }}
                className="underline hover:text-accent-amber"
              >
                Player (alex@quizclash.com)
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
