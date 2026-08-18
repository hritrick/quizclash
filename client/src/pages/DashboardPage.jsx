import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Play,
  User,
  Users,
  Search,
  Filter,
  Flame,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

const CATEGORIES = [
  'All',
  'General Knowledge',
  'History',
  'Science & Tech',
  'Geography',
  'Pop Culture & Movies',
  'Sports & Games',
  'Music & Arts',
  'Mythology & Literature',
];

const DIFFICULTIES = ['All', 'easy', 'medium', 'hard'];

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [creatingRoomQuizId, setCreatingRoomQuizId] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/quizzes', { params });
      if (res.data.success) {
        setQuizzes(res.data.data.quizzes);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      navigate(`/lobby/${joinCode.trim().toUpperCase()}`);
    }
  };

  const handleCreateMultiplayerRoom = async (quizId) => {
    setCreatingRoomQuizId(quizId);
    try {
      const res = await api.post('/rooms', { quizId, mode: 'multiplayer' });
      if (res.data.success) {
        const code = res.data.data.room.code;
        navigate(`/lobby/${code}`);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create room');
    } finally {
      setCreatingRoomQuizId(null);
    }
  };

  const handleStartSoloChallenge = async (quizId) => {
    setCreatingRoomQuizId(quizId);
    try {
      const res = await api.post('/rooms', { quizId, mode: 'solo' });
      if (res.data.success) {
        const code = res.data.data.room.code;
        navigate(`/game/${code}`);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to launch solo game');
    } finally {
      setCreatingRoomQuizId(null);
    }
  };

  const getDifficultyBadgeVariant = (diff) => {
    switch (diff) {
      case 'easy':
        return 'teal';
      case 'medium':
        return 'amber';
      case 'hard':
        return 'coral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
      {/* Top Banner with Asymmetric Dual Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Left: Direct Room Code Join */}
        <div className="lg:col-span-5 bg-cream-50 border-2 border-ink-900 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#14110F] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="coral">Live Lobby</Badge>
              <span className="text-xs font-bold text-ink-600">Got an invite?</span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-ink-950 mb-2">
              Enter Room Code
            </h2>
            <p className="text-sm text-ink-700 mb-4">
              Enter the 6-character room code given by your host or friend to join their lobby.
            </p>
          </div>

          <form onSubmit={handleJoinByCode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. CLASH7"
              className="flex-1 bg-cream-100 border-2 border-ink-900 rounded-xl px-4 py-2.5 font-mono font-bold text-base text-ink-950 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-amber"
            />
            <Button type="submit" variant="coral" size="md" disabled={joinCode.length !== 6}>
              Join
            </Button>
          </form>
        </div>

        {/* Right: Player Welcome and Quick Solo Play CTA */}
        <div className="lg:col-span-7 bg-ink-900 border-2 border-ink-950 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#F2A93B] text-cream-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase text-accent-amber tracking-wider">
                ⚡ QuizClash Arena
              </span>
              <span className="text-xs font-bold bg-ink-800 px-2.5 py-1 rounded-md border border-ink-700">
                {quizzes.length} Quizzes Available
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-cream-100 mb-2">
              Welcome, {user?.username || 'Challenger'}!
            </h2>
            <p className="text-sm text-cream-300/80 mb-4">
              Pick any quiz below to host a real-time multiplayer room with friends or jump straight into a solo challenge to test your knowledge.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-accent-amber bg-ink-800/80 px-3 py-1.5 rounded-xl border border-ink-700">
              <Award className="w-4 h-4" />
              {user?.stats?.wins || 0} Wins
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent-coral bg-ink-800/80 px-3 py-1.5 rounded-xl border border-ink-700">
              <Flame className="w-4 h-4" />
              {user?.stats?.totalScore || 0} Total Score
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cream-100 border-2 border-ink-900 rounded-2xl p-4 mb-8 shadow-[3px_3px_0px_0px_#14110F]">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-ink-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quizzes..."
              className="w-full bg-cream-50 border-2 border-ink-900 rounded-xl pl-9 pr-3 py-1.5 text-sm font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-accent-amber"
            />
          </form>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all border-2 ${
                  selectedCategory === cat
                    ? 'bg-ink-900 text-cream-50 border-ink-900 shadow-[2px_2px_0px_0px_#231E1B]'
                    : 'bg-cream-50 text-ink-800 border-ink-900/30 hover:bg-cream-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-display font-bold text-ink-700">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-cream-50 border-2 border-ink-900 rounded-xl px-2.5 py-1 text-xs font-bold text-ink-950 focus:outline-none"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <LoadingState message="Loading quiz catalog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuizzes} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No Quizzes Found"
          description="Try selecting another category or clear your search query."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSelectedDifficulty('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const questionCount = quiz.questionIds?.length || 0;
            const isActing = creatingRoomQuizId === quiz._id;

            return (
              <Card
                key={quiz._id}
                hover
                className="flex flex-col justify-between border-2 border-ink-900 shadow-[5px_5px_0px_0px_#14110F]"
              >
                <div>
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={getDifficultyBadgeVariant(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                    <span className="text-xs font-bold text-ink-600 font-mono">
                      {quiz.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-extrabold text-ink-950 mb-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-ink-700 line-clamp-2 mb-4">
                    {quiz.description || 'Test your reflexes and recall in this high-intensity quiz showdown.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-ink-200">
                  <div className="flex items-center justify-between text-xs font-bold text-ink-600 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {questionCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-accent-coral" />
                      {quiz.playsCount || 0} Matches Played
                    </span>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isActing}
                      onClick={() => handleCreateMultiplayerRoom(quiz._id)}
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Host Room
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isActing}
                      onClick={() => handleStartSoloChallenge(quiz._id)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Solo Play
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
