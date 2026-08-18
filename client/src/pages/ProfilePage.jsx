import React, { useState } from 'react';
import { User, Trophy, Award, Flame, Dice5, Save, Check } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || 'quizzer');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleReroll = () => {
    setAvatarSeed('quiz_' + Math.random().toString(36).substring(2, 9));
    setSaved(false);
  };

  const handleSaveAvatar = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/auth/me', { avatarSeed });
      if (res.data.success) {
        updateUser({ avatarSeed });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      alert('Failed to update avatar.');
    } finally {
      setSaving(false);
    }
  };

  const stats = user?.stats || {
    gamesPlayed: 0,
    wins: 0,
    totalScore: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  };

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const accuracy =
    stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-black text-ink-950">
          Player Profile & Stats
        </h1>
        <p className="text-sm text-ink-700 mt-1">Manage your identity and review battle performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Identity & Avatar customizer */}
        <Card className="md:col-span-5 flex flex-col items-center text-center p-6 shadow-[5px_5px_0px_0px_#14110F]">
          <Avatar seed={avatarSeed} size="2xl" className="mb-4" />

          <h2 className="font-display font-black text-2xl text-ink-950 mb-1">{user?.username}</h2>
          <span className="text-xs text-ink-600 font-mono mb-3">{user?.email}</span>

          <Badge variant={user?.role === 'admin' ? 'coral' : user?.role === 'host' ? 'amber' : 'teal'} size="sm" className="mb-6">
            Role: {user?.role}
          </Badge>

          <div className="w-full pt-4 border-t-2 border-ink-900 flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={handleReroll} className="w-full">
              <Dice5 className="w-4 h-4 mr-1.5" />
              Reroll Avatar
            </Button>

            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSaveAvatar}
              className="w-full"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Identity
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Right Column: Battle Statistics Matrix */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
              <div className="flex items-center gap-2 text-xs font-display font-bold text-ink-700 uppercase mb-1">
                <Trophy className="w-4 h-4 text-accent-amber" />
                Matches Won
              </div>
              <span className="font-mono font-black text-3xl text-ink-950">{stats.wins}</span>
              <span className="block text-[11px] text-ink-600 mt-1">out of {stats.gamesPlayed} played</span>
            </Card>

            <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
              <div className="flex items-center gap-2 text-xs font-display font-bold text-ink-700 uppercase mb-1">
                <Flame className="w-4 h-4 text-accent-coral" />
                Win Rate
              </div>
              <span className="font-mono font-black text-3xl text-accent-coral">{winRate}%</span>
              <span className="block text-[11px] text-ink-600 mt-1">Victories percentage</span>
            </Card>

            <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
              <div className="flex items-center gap-2 text-xs font-display font-bold text-ink-700 uppercase mb-1">
                <Award className="w-4 h-4 text-accent-teal" />
                Accuracy
              </div>
              <span className="font-mono font-black text-3xl text-accent-teal">{accuracy}%</span>
              <span className="block text-[11px] text-ink-600 mt-1">
                {stats.correctAnswers} / {stats.totalAnswers} correct
              </span>
            </Card>

            <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
              <div className="flex items-center gap-2 text-xs font-display font-bold text-ink-700 uppercase mb-1">
                <User className="w-4 h-4 text-accent-violet" />
                Lifetime Points
              </div>
              <span className="font-mono font-black text-3xl text-accent-amber">
                {stats.totalScore.toLocaleString()}
              </span>
              <span className="block text-[11px] text-ink-600 mt-1">Total score accumulated</span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
