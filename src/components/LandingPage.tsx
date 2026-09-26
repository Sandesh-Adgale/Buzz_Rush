import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlusCircle, LogIn, Sparkles, Zap, Shield, Trophy, Smartphone, Radio } from 'lucide-react';

interface LandingPageProps {
  initialRoomCode?: string;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string, teamName: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  initialRoomCode = '',
  onCreateRoom,
  onJoinRoom,
  isLoading,
  errorMessage,
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode.toLowerCase());
  const [teamName, setTeamName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toLowerCase().trim());
    }
  }, [initialRoomCode]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanCode = roomCode.trim().toLowerCase();
    const cleanTeam = teamName.trim();

    if (!cleanCode) {
      setValidationError('Please enter a room code');
      return;
    }
    if (cleanCode.length < 3) {
      setValidationError('Room codes are at least 5 characters');
      return;
    }
    if (!cleanTeam) {
      setValidationError('Please enter your team name');
      return;
    }
    if (cleanTeam.length > 20) {
      setValidationError('Team name must be under 20 characters');
      return;
    }

    onJoinRoom(cleanCode, cleanTeam);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-grid-pattern relative overflow-hidden">
      {/* Dynamic Animated Ambient Glow Circles */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-600/20 blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-500/15 blur-[100px] pointer-events-none"
      />

      {/* Main Split Screen Container */}
      <div className="w-full max-w-5xl rounded-[28px] border border-white/15 bg-slate-950/70 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT SIDE: Create Room & Visual Presentation */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-purple-950/30">
          {/* Subtle decorative circles */}
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full border border-cyan-500/10 pointer-events-none" />
          <div className="absolute top-6 right-6 w-56 h-56 rounded-full border border-purple-500/10 pointer-events-none" />

          {/* Tag & Heading */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Low-Latency Real-Time Buzzers</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-[1.1] mb-3">
              Identify <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Who Tapped</span> First
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">
              Millisecond precision for trivia nights, academic bowls, corporate games, and esports tournaments. Every buzz ranked with split-second accuracy.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Sub-millisecond sorting</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full screen mobile buzzer</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <Radio className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Custom audio FX & sync</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Round logs & CSV export</span>
              </div>
            </div>
          </div>

          {/* Create Room Button Area */}
          <div className="pt-8 mt-6 border-t border-white/10">
            <div className="text-xs text-slate-400 mb-2 font-medium">Hosting an event or quiz?</div>
            <motion.button
              type="button"
              id="create-room-button"
              onClick={onCreateRoom}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-display font-black text-base uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5 text-cyan-200 group-hover:rotate-90 transition-transform duration-300" />
              <span>{isLoading ? 'Creating Room...' : 'Create New Room (Host)'}</span>
            </motion.button>
            <span className="text-[11px] text-slate-500 text-center block mt-2">
              Generates a unique 5-character room code & QR code instantly
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Join Room Form */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-slate-900/50 relative">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <LogIn className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="font-display font-black text-2xl text-white tracking-wide uppercase">
                Join As Team
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Enter your room code and team name to connect your mobile buzzer.
            </p>

            {/* Error alerts */}
            {(errorMessage || validationError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{errorMessage || validationError}</span>
              </motion.div>
            )}

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              {/* Room Code input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Room Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="room-code-input"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8))}
                    placeholder="e.g. 11hhw"
                    maxLength={8}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white font-mono-numbers text-lg uppercase tracking-widest placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal outline-none transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 uppercase font-mono">
                    5 chars
                  </span>
                </div>
              </div>

              {/* Team Name input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  id="team-name-input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Cyber Wolves, Alpha Squad"
                  maxLength={25}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white text-sm placeholder:text-slate-600 outline-none transition"
                />
              </div>

              {/* Submit Join Button */}
              <motion.button
                type="submit"
                id="join-room-button"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-display font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Join Game Now'}</span>
              </motion.button>
            </form>

            {/* Quick demo code notice */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-500">
              Assigned a vibrant team color upon entry. Screen turns into your dedicated buzzer.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
