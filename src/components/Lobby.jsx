import React, { useState } from 'react';
import { Copy, Check, Users, Play, Shield, Wifi, Edit2, Sparkles, Clock, BookOpen } from 'lucide-react';

export default function Lobby({ roomCode, players, setPlayers, onStartQuiz, userName, setUserName }) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleUserReady = () => {
    setPlayers(prev =>
      prev.map(p => (p.isCurrentUser ? { ...p, isReady: !p.isReady } : p))
    );
  };

  const readyCount = players.filter(p => p.isReady).length;
  const allReady = readyCount === players.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-slide">
      {/* Editorial Header */}
      <div className="text-center mb-10 sm:mb-14 border-b border-stone-200 dark:border-stone-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-300 dark:border-stone-800 text-xs tracking-widest uppercase text-stone-600 dark:text-stone-400 mb-4 bg-paper-100/50 dark:bg-paper-900/50">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Real-time Multiplayer Chamber</span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-paper-900 dark:text-paper-50 mb-3">
          The Grand Chronicle
        </h1>
        <p className="font-serif italic text-lg sm:text-xl text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
          A test of erudition and swift general knowledge.
        </p>

        {/* Room Code Banner */}
        <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-6 py-3 rounded-lg border border-stone-300 dark:border-stone-800 bg-paper-100/70 dark:bg-paper-900/60 backdrop-blur-sm">
          <div className="text-left">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-medium">
              Chamber Code
            </span>
            <span className="font-serif text-2xl font-bold tracking-widest text-accent">
              {roomCode}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-800 hidden sm:block"></div>

          <button
            onClick={handleCopyCode}
            type="button"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded border border-stone-300 dark:border-stone-700 hover:border-accent text-xs uppercase tracking-wider font-semibold text-paper-800 dark:text-paper-200 hover:text-accent transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emeraldCustom" />
                <span className="text-emeraldCustom">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: User Profile & Game Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Player Identity & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-lg border border-stone-200 dark:border-stone-800/80 bg-paper-100/40 dark:bg-paper-900/40">
            <h3 className="font-serif text-xl font-medium text-paper-900 dark:text-paper-100 mb-4 flex items-center justify-between">
              <span>Your Identity</span>
              <Shield className="w-4 h-4 text-accent" />
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1 font-medium">
                  Player Alias
                </label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      autoFocus
                      className="w-full px-3 py-1.5 text-sm bg-paper-50 dark:bg-paper-950 border border-accent rounded focus:outline-none text-paper-900 dark:text-paper-100"
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-1 text-xs bg-accent text-paper-950 rounded font-semibold uppercase tracking-wider"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center justify-between p-2.5 rounded border border-stone-200 dark:border-stone-800 bg-paper-50 dark:bg-paper-950 hover:border-accent/60 cursor-pointer transition-colors"
                  >
                    <span className="font-medium text-paper-900 dark:text-paper-100 text-sm">
                      {userName}
                    </span>
                    <Edit2 className="w-3.5 h-3.5 text-stone-400 hover:text-accent" />
                  </div>
                )}
              </div>

              {/* Ready Status Switch */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={toggleUserReady}
                  className={`w-full py-2.5 px-4 rounded border text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    players.find(p => p.isCurrentUser)?.isReady
                      ? 'bg-emeraldCustom/10 border-emeraldCustom/40 text-emeraldCustom dark:text-emerald-400'
                      : 'bg-stone-200/50 dark:bg-stone-800/50 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-accent'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${players.find(p => p.isCurrentUser)?.isReady ? 'bg-emeraldCustom animate-pulse' : 'bg-stone-400'}`}></span>
                  <span>{players.find(p => p.isCurrentUser)?.isReady ? 'Status: Ready' : 'Set Ready Status'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quiz Details Badge */}
          <div className="p-6 rounded-lg border border-stone-200 dark:border-stone-800/80 bg-paper-100/40 dark:bg-paper-900/40 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400 mb-2">
              Experiment Manifest
            </h4>
            
            <div className="flex items-center justify-between text-sm py-1 border-b border-stone-200/60 dark:border-stone-800/60">
              <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-accent" /> Questions
              </span>
              <span className="font-serif font-semibold text-paper-900 dark:text-paper-100">8 Items</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-stone-200/60 dark:border-stone-800/60">
              <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-accent" /> Time limit
              </span>
              <span className="font-serif font-semibold text-paper-900 dark:text-paper-100">15s per question</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-accent" /> Simulation
              </span>
              <span className="text-xs uppercase tracking-wider text-emeraldCustom font-semibold">6 Live Peers</span>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Players List */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-paper-100/40 dark:bg-paper-900/40">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h2 className="font-serif text-2xl font-normal text-paper-900 dark:text-paper-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span>Connected Scholars</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Waiting for players to finalize readiness before commencement
              </p>
            </div>
            
            <div className="text-right">
              <span className="font-serif text-xl font-bold text-accent">
                {readyCount}/{players.length}
              </span>
              <span className="text-xs text-stone-500 block uppercase tracking-wider">Ready</span>
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-3.5 rounded border transition-all flex items-center justify-between ${
                  player.isCurrentUser
                    ? 'border-accent/80 bg-accent/5 dark:bg-accent/10 shadow-subtle'
                    : 'border-stone-200 dark:border-stone-800/80 bg-paper-50 dark:bg-paper-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Initials Circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-sm shadow-sm ${player.avatarBg}`}
                  >
                    {player.initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-paper-900 dark:text-paper-100">
                        {player.isCurrentUser ? userName : player.name}
                      </span>
                      {player.isCurrentUser && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block">
                      {player.title}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-mono hidden xs:inline">
                    {player.ping}
                  </span>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      player.isReady
                        ? 'bg-emeraldCustom/10 text-emeraldCustom dark:text-emerald-400 border border-emeraldCustom/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${player.isReady ? 'bg-emeraldCustom' : 'bg-amber-500'}`}></span>
                    <span>{player.isReady ? 'Ready' : 'Waiting'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
              {allReady
                ? '✦ All scholars are standing by. Ready to begin.'
                : '✦ Waiting for all scholars to signal ready state...'}
            </div>

            <button
              onClick={onStartQuiz}
              type="button"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-accent hover:bg-accent-hover text-paper-950 font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-editorial flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Begin Experiment</span>
              <Play className="w-4 h-4 text-paper-950 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
