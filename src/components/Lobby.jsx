import React, { useState } from 'react';
import { Copy, Check, Users, Play, Shield, Wifi, Edit2, Sparkles, Clock, BookOpen, QrCode, Crown, CheckCircle2 } from 'lucide-react';

export default function Lobby({ roomCode, players, setPlayers, onStartQuiz, userName, setUserName }) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showQR, setShowQR] = useState(false);

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
    <div className="max-w-[1320px] mx-auto px-6 sm:px-12 lg:px-16 py-8 sm:py-12 animate-fade-slide relative">
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 dark:bg-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Title Header */}
      <header className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 dark:bg-accent/15 text-xs font-bold uppercase tracking-widest text-accent mb-6 shadow-subtle backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>Real-Time Arena Chamber</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-paper-900 dark:text-paper-50 mb-4">
          The Grand Chronicle
        </h1>
        <p className="font-serif italic text-xl sm:text-2xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
          An interactive trial of general erudition & competitive intellect.
        </p>

        {/* Room Code Display Card */}
        <div className="mt-10 inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-8 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-paper-50/90 dark:bg-paper-900/80 backdrop-blur-md shadow-elevated hover:border-accent/60 transition-all duration-300">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 block font-semibold">
              Chamber Passcode
            </span>
            <span className="font-serif text-3xl font-bold tracking-widest text-accent drop-shadow-sm">
              {roomCode}
            </span>
          </div>

          <div className="h-8 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-paper-100/60 dark:bg-paper-800/60 hover:border-accent text-xs uppercase tracking-widest font-bold text-paper-900 dark:text-paper-100 hover:text-accent transition-all cursor-pointer shadow-subtle group"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emeraldCustom" />
                  <span className="text-emeraldCustom">Code Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500 group-hover:text-accent transition-colors" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              type="button"
              className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-paper-100/60 dark:bg-paper-800/60 hover:border-accent text-stone-500 hover:text-accent transition-all cursor-pointer"
              title="Show Room QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* QR Code Popover Simulation */}
        {showQR && (
          <div className="mt-4 p-4 max-w-xs mx-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-paper-50 dark:bg-paper-900 shadow-elevated animate-fade-slide">
            <div className="w-32 h-32 mx-auto bg-stone-900 p-2 rounded-lg flex items-center justify-center text-paper-50 font-mono text-[10px]">
              [ QR : {roomCode} ]
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-mono">Scan to join on mobile</p>
          </div>
        )}
      </header>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
        {/* Left Column: Player Identity & Session Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Box */}
          <div className="p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-paper-50/80 dark:bg-paper-900/60 backdrop-blur-md shadow-elevated space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-xl font-normal text-paper-900 dark:text-paper-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>Your Scholar Profile</span>
              </h3>
              <Crown className="w-4 h-4 text-accent/60" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-stone-500 dark:text-stone-400 block mb-1.5 font-semibold">
                  Display Alias
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
                      className="w-full px-3.5 py-2 text-sm bg-paper-100 dark:bg-paper-950 border border-accent rounded-lg focus:outline-none text-paper-900 dark:text-paper-100 font-semibold"
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-4 py-2 text-xs bg-accent text-paper-950 rounded-lg font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-paper-100/50 dark:bg-paper-950/50 hover:border-accent cursor-pointer transition-all group"
                  >
                    <span className="font-semibold text-paper-900 dark:text-paper-100 text-sm">
                      {userName}
                    </span>
                    <Edit2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-accent transition-colors" />
                  </div>
                )}
              </div>

              {/* Ready Status Switch */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={toggleUserReady}
                  className={`w-full py-3 px-4 rounded-xl border text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 shadow-subtle ${
                    players.find(p => p.isCurrentUser)?.isReady
                      ? 'bg-emeraldCustom/15 border-emeraldCustom/50 text-emeraldCustom dark:text-emerald-400 shadow-glow-emerald'
                      : 'bg-stone-200/60 dark:bg-stone-800/60 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-accent'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${players.find(p => p.isCurrentUser)?.isReady ? 'bg-emeraldCustom animate-ping' : 'bg-stone-400'}`}></span>
                  <span>{players.find(p => p.isCurrentUser)?.isReady ? 'Status: Ready to Battle' : 'Set Ready Status'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Session Rules Card */}
          <div className="p-6 sm:p-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-paper-50/80 dark:bg-paper-900/60 backdrop-blur-md shadow-elevated space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400 pb-2 border-b border-stone-200 dark:border-stone-800">
              Session Manifest
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2 font-medium">
                  <BookOpen className="w-4 h-4 text-accent" /> Question Deck
                </span>
                <span className="font-serif font-bold text-paper-900 dark:text-paper-100">8 Questions</span>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-accent" /> Time Per Item
                </span>
                <span className="font-serif font-bold text-paper-900 dark:text-paper-100">15 Seconds</span>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-stone-600 dark:text-stone-400 flex items-center gap-2 font-medium">
                  <Wifi className="w-4 h-4 text-accent" /> Mode
                </span>
                <span className="text-xs uppercase tracking-wider text-emeraldCustom font-bold px-2 py-0.5 rounded bg-emeraldCustom/10">
                  Live Multiplayer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Scholars Grid */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-paper-50/80 dark:bg-paper-900/60 backdrop-blur-md shadow-elevated space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-paper-900 dark:text-paper-100 flex items-center gap-3">
                <Users className="w-6 h-6 text-accent" />
                <span>Connected Scholars</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Roster standing by for commencement of the quiz trial
              </p>
            </div>

            <div className="text-right">
              <span className="font-serif text-3xl font-bold text-accent">
                {readyCount}/{players.length}
              </span>
              <span className="text-[10px] text-stone-500 block uppercase tracking-widest font-semibold">Ready</span>
            </div>
          </div>

          {/* Connected Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  player.isCurrentUser
                    ? 'border-accent/80 bg-accent/10 dark:bg-accent/15 shadow-glow-accent'
                    : 'border-stone-200/80 dark:border-stone-800/80 bg-paper-100/50 dark:bg-paper-950/50 hover:border-accent/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm shadow-subtle ${player.avatarBg}`}
                  >
                    {player.initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-paper-900 dark:text-paper-100">
                        {player.isCurrentUser ? userName : player.name}
                      </span>
                      {player.isCurrentUser && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-paper-950 font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block">
                      {player.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-mono hidden xs:inline">
                    {player.ping}
                  </span>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      player.isReady
                        ? 'bg-emeraldCustom/15 text-emeraldCustom dark:text-emerald-400 border border-emeraldCustom/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${player.isReady ? 'bg-emeraldCustom' : 'bg-amber-500'}`}></span>
                    <span>{player.isReady ? 'Ready' : 'Waiting'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>{allReady ? 'All scholars ready. You may launch the session.' : 'Waiting for ready confirmation from scholars.'}</span>
            </div>

            <button
              onClick={onStartQuiz}
              type="button"
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-accent hover:bg-accent-hover text-paper-950 font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-glow-accent flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.02]"
            >
              <span>Commence Experiment</span>
              <Play className="w-4 h-4 fill-paper-950 text-paper-950 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
