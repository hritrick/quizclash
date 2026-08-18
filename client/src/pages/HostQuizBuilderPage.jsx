import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, CheckCircle2, Save, HelpCircle, ArrowLeft } from 'lucide-react';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const CATEGORIES = [
  'General Knowledge',
  'History',
  'Science & Tech',
  'Geography',
  'Pop Culture & Movies',
  'Sports & Games',
  'Music & Arts',
  'Mythology & Literature',
];

export const HostQuizBuilderPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState('medium');

  const [questions, setQuestions] = useState([
    {
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      timeLimitSec: 15,
      points: 1000,
      explanation: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        timeLimitSec: 15,
        points: 1000,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!title.trim()) {
      setError('Please provide a quiz title');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question #${i + 1} text is empty`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1}, Option ${j + 1} is empty`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const res = await api.post('/quizzes', {
        title,
        description,
        category,
        difficulty,
        questions,
      });

      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-ink-700 hover:text-ink-950 mb-6 bg-cream-100 px-3 py-1.5 rounded-xl border border-ink-900 shadow-[2px_2px_0px_0px_#14110F]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Arena
      </button>

      <div className="text-center mb-8">
        <Badge variant="amber" size="sm" className="mb-2">
          Quiz Master Studio
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-ink-950">
          Create a New Pub Quiz
        </h1>
        <p className="text-sm text-ink-700 mt-1">
          Compose high-intensity trivia rounds, customize time limits, and set buzzer points.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-100 border-2 border-rose-900/40 rounded-2xl text-rose-900 text-sm font-bold shadow-[3px_3px_0px_0px_#14110F]">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Meta Card */}
        <Card className="shadow-[5px_5px_0px_0px_#14110F]">
          <h3 className="font-display font-bold text-lg text-ink-950 mb-4 pb-2 border-b-2 border-ink-900">
            1. Quiz Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. World Cinema & Iconic Soundtracks"
                className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl px-4 py-2.5 font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-accent-amber"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl px-3 py-2.5 font-bold text-ink-950 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl px-3 py-2.5 font-bold text-ink-950 focus:outline-none"
                >
                  <option value="easy">Easy (Casual)</option>
                  <option value="medium">Medium (Competitive)</option>
                  <option value="hard">Hard (Brutal Masters)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                Description / Host Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief intro or rules for your players..."
                className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl px-4 py-2 text-sm font-medium text-ink-950 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-2xl text-ink-950">
              2. Questions ({questions.length})
            </h3>
            <Button variant="secondary" size="sm" onClick={handleAddQuestion}>
              <PlusCircle className="w-4 h-4 mr-1.5 text-accent-teal" />
              Add Question
            </Button>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="shadow-[5px_5px_0px_0px_#14110F]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-ink-900">
                <span className="font-display font-black text-base text-ink-950">
                  Question #{qIndex + 1}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-ink-600">⏱️</span>
                    <select
                      value={q.timeLimitSec}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, 'timeLimitSec', Number(e.target.value))
                      }
                      className="bg-cream-100 border border-ink-900 rounded-lg px-2 py-1 text-xs font-bold font-mono"
                    >
                      <option value={10}>10s</option>
                      <option value={15}>15s</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                    </select>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="p-1.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                  Question Prompt
                </label>
                <input
                  type="text"
                  required
                  value={q.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                  placeholder="e.g. Which chemical element has the symbol 'Fe'?"
                  className="w-full bg-cream-100 border-2 border-ink-900 rounded-xl px-4 py-2.5 font-bold text-ink-950 focus:outline-none"
                />
              </div>

              {/* 4 Options with Radio Select for Correct Answer */}
              <div className="mb-4">
                <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-2">
                  Answer Options (Select the correct one with the checkmark)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => {
                    const isCorrect = q.correctIndex === optIndex;
                    return (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded-xl border-2 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-600'
                            : 'bg-cream-100 border-ink-900'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(qIndex, 'correctIndex', optIndex)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs ${
                            isCorrect
                              ? 'bg-emerald-600 border-emerald-800 text-white'
                              : 'bg-cream-200 border-ink-600 text-ink-600 hover:bg-emerald-100'
                          }`}
                          title="Set as correct option"
                        >
                          {isCorrect ? '✓' : optIndex + 1}
                        </button>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 bg-transparent text-sm font-bold text-ink-950 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-display font-bold uppercase text-ink-800 mb-1">
                  Explanation / Trivia Fact (Revealed after question)
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                  placeholder="e.g. Fe comes from the Latin word Ferrum."
                  className="w-full bg-cream-100 border border-ink-700 rounded-xl px-3 py-1.5 text-xs text-ink-900 focus:outline-none"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="coral" size="lg" isLoading={loading}>
            <Save className="w-5 h-5 mr-2" />
            Publish Quiz to Arena
          </Button>
        </div>
      </form>
    </div>
  );
};
