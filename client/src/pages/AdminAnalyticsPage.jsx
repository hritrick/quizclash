import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../lib/axios';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

export const AdminAnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sortBy, setSortBy] = useState('accuracy');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overRes, qRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/analytics/questions', {
          params: { sortBy, order: sortOrder },
        }),
      ]);

      if (overRes.data.success) setOverview(overRes.data.data);
      if (qRes.data.success) setQuestions(qRes.data.data.questions);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const chartData = questions.slice(0, 10).map((q) => ({
    name: q.text.length > 25 ? q.text.substring(0, 25) + '...' : q.text,
    accuracy: q.accuracy,
    avgTime: q.avgAnswerTimeSec,
  }));

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
      <div className="text-center mb-8">
        <Badge variant="coral" size="sm" className="mb-2">
          Admin Observatory
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-ink-950">
          Quiz & Question Performance Analytics
        </h1>
        <p className="text-sm text-ink-700 mt-1">
          Deep-dive into player question accuracy rates, response speeds, and difficulty curves.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Aggregating performance telemetry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAnalytics} />
      ) : (
        <div className="space-y-8">
          {/* Top KPI Metrics Cards */}
          {overview && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
                <span className="text-xs font-display font-bold text-ink-600 uppercase">
                  Total Quizzes
                </span>
                <span className="block font-mono font-black text-3xl text-ink-950 mt-1">
                  {overview.totalQuizzes}
                </span>
              </Card>

              <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
                <span className="text-xs font-display font-bold text-ink-600 uppercase">
                  Total Questions
                </span>
                <span className="block font-mono font-black text-3xl text-accent-teal mt-1">
                  {overview.totalQuestions}
                </span>
              </Card>

              <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
                <span className="text-xs font-display font-bold text-ink-600 uppercase">
                  Matches Completed
                </span>
                <span className="block font-mono font-black text-3xl text-accent-coral mt-1">
                  {overview.totalMatches}
                </span>
              </Card>

              <Card className="p-4 shadow-[4px_4px_0px_0px_#14110F]">
                <span className="text-xs font-display font-bold text-ink-600 uppercase">
                  Registered Players
                </span>
                <span className="block font-mono font-black text-3xl text-accent-amber mt-1">
                  {overview.totalUsers}
                </span>
              </Card>
            </div>
          )}

          {/* Visual Analytics Chart: Lowest Accuracy Questions */}
          <Card className="p-6 shadow-[5px_5px_0px_0px_#14110F]">
            <h3 className="font-display font-bold text-lg text-ink-950 mb-2">
              Accuracy Rate (%) by Question
            </h3>
            <p className="text-xs text-ink-600 mb-6">
              Identifies which questions are most commonly missed or answered correctly.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#4D4540"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#4D4540" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14110F',
                      borderColor: '#14110F',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="accuracy" name="Accuracy %" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.accuracy < 40 ? '#FF5A4E' : entry.accuracy > 70 ? '#1F8A70' : '#F2A93B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Detailed Questions Table */}
          <Card className="shadow-[5px_5px_0px_0px_#14110F] overflow-x-auto p-0">
            <div className="p-4 border-b-2 border-ink-900 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-ink-950">
                Question Inventory & Difficulty Breakdown
              </h3>
              <span className="text-xs font-mono font-bold text-ink-600">
                {questions.length} Questions Tracked
              </span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200 border-b-2 border-ink-900 text-xs font-display font-black uppercase text-ink-700 tracking-wider">
                  <th className="py-3 px-4">Question Prompt</th>
                  <th className="py-3 px-4">Quiz / Category</th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-ink-950"
                    onClick={() => toggleSort('timesAnswered')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Answers <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-ink-950"
                    onClick={() => toggleSort('accuracy')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Accuracy <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-ink-950"
                    onClick={() => toggleSort('avgTime')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Avg Speed <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">Difficulty Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink-900/10">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-cream-100 transition-colors text-xs sm:text-sm">
                    <td className="py-3 px-4 font-bold text-ink-950 max-w-xs truncate">
                      {q.text}
                    </td>
                    <td className="py-3 px-4 text-ink-700">
                      <span className="block font-medium truncate">{q.quizTitle}</span>
                      <span className="text-[10px] text-ink-500 font-mono">{q.category}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      {q.timesAnswered}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg border ${
                          q.accuracy > 70
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : q.accuracy >= 40
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {q.accuracy}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-ink-800">
                      {q.avgAnswerTimeSec}s
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          q.difficultyRating === 'Easy'
                            ? 'teal'
                            : q.difficultyRating === 'Balanced'
                            ? 'amber'
                            : 'coral'
                        }
                        size="xs"
                      >
                        {q.difficultyRating}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};
