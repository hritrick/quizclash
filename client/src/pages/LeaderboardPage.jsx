import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Target, Clock, Filter, Sparkles } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export const LeaderboardPage = () => {
  const { user } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'history'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lbRes, histRes] = await Promise.allSettled([
        api.get('/leaderboard/global'),
        user ? api.get('/leaderboard/history') : Promise.resolve({ data: { success: true, data: { matches: [] } } }),
      ]);

      if (lbRes.status === 'fulfilled' && lbRes.value.data.success) {
        setGlobalLeaderboard(lbRes.value.data.data.leaderboard);
      }
      if (histRes.status === 'fulfilled' && histRes.value.data.success) {
        setMyHistory(histRes.value.data.data.matches);
      }
    } catch (err) {
      setError('Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="amber" size="sm" className="mb-2">
          <Trophy className="w-3.5 h-3.5" />
          Hall of Champions
        </Badge>
        <h1 className="text-4xl font-display font-black text-ink-950">
          Global Trivia Leaderboard
        </h1>
        <p className="text-sm text-ink-700 mt-1">
          Top scoring competitors ranked by arena match performance and win rate.
        </p>
      </div>

      {/* Switcher Tab */}
      <div className="flex justify-center mb-8">
        <div className="bg-cream-300 p-1 rounded-xl border-2 border-ink-900 shadow-[3px_3px_0px_0px_#14110F] inline-flex">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-5 py-2 rounded-lg font-display font-bold text-sm transition-all ${
              activeTab === 'global'
                ? 'bg-ink-900 text-cream-50 shadow-sm'
                : 'text-ink-800 hover:text-ink-950'
            }`}
          >
            🏆 Top Global Warriors
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-lg font-display font-bold text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-ink-900 text-cream-50 shadow-sm'
                  : 'text-ink-800 hover:text-ink-950'
              }`}
            >
              📜 My Match History ({myHistory.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Summoning leaderboard rankings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : activeTab === 'global' ? (
        globalLeaderboard.length === 0 ? (
          <EmptyState
            title="No Matches Logged Yet"
            description="Be the first player to complete a match and claim rank #1 on the leaderboard!"
          />
        ) : (
          <Card className="shadow-[6px_6px_0px_0px_#14110F] overflow-x-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200 border-b-2 border-ink-900 text-xs font-display font-black uppercase text-ink-700 tracking-wider">
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4 text-center">Matches</th>
                  <th className="py-3.5 px-4 text-center">Wins</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink-900/10">
                {globalLeaderboard.map((player) => {
                  const isMe = user && (user.id === player.userId || user._id === player.userId);

                  let rankIcon = `#${player.rank}`;
                  if (player.rank === 1) rankIcon = '🥇 1st';
                  if (player.rank === 2) rankIcon = '🥈 2nd';
                  if (player.rank === 3) rankIcon = '🥉 3rd';

                  return (
                    <tr
                      key={player.userId}
                      className={`transition-colors ${
                        isMe ? 'bg-amber-50/80 font-bold' : 'hover:bg-cream-100'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-display font-black text-sm">
                        {rankIcon}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar seed={player.avatarSeed || player.username} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-display font-bold text-sm text-ink-950 flex items-center gap-1.5">
                              {player.username}
                              {isMe && (
                                <span className="text-[9px] bg-ink-900 text-cream-50 px-1 py-0.2 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-ink-600 uppercase font-mono">
                              {player.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                        {player.gamesPlayed}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-accent-teal">
                        {player.wins}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-ink-700">
                        {player.accuracy}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-base text-accent-coral">
                        {player.totalScore.toLocaleString()} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )
      ) : myHistory.length === 0 ? (
        <EmptyState
          title="No Match History Found"
          description="Complete your first match in the arena to see your performance logs here."
        />
      ) : (
        <div className="space-y-3">
          {myHistory.map((m) => (
            <Card
              key={m.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 shadow-[4px_4px_0px_0px_#14110F]"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={m.rank === 1 ? 'amber' : 'neutral'} size="xs">
                    Rank #{m.rank} of {m.totalPlayers}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-ink-600">{m.category}</span>
                </div>
                <h4 className="font-display font-bold text-base text-ink-950">{m.quizTitle}</h4>
                <span className="text-[11px] text-ink-600">
                  Played: {new Date(m.playedAt).toLocaleDateString()} at{' '}
                  {new Date(m.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-[11px] font-bold text-ink-600 uppercase">Score</span>
                  <span className="font-mono font-black text-lg text-accent-coral">
                    {m.score.toLocaleString()} pts
                  </span>
                </div>
                <div className="text-right pl-3 border-l border-ink-300">
                  <span className="block text-[11px] font-bold text-ink-600 uppercase">Correct</span>
                  <span className="font-mono font-bold text-sm text-accent-teal">
                    {m.correctCount} / {m.totalQuestions}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
