import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Lock,
  RotateCcw,
  Plus,
  Volume2,
  Users,
  Trophy,
  History,
  QrCode,
  Settings,
  Sparkles,
} from 'lucide-react';
import { RoomData, AudioConfig } from '../types';
import { RoomCodeCard } from './RoomCodeCard';
import { TeamCard } from './TeamCard';
import { Leaderboard } from './Leaderboard';
import { RoundHistory } from './RoundHistory';
import { AudioUploader } from './AudioUploader';
import { QRShare } from './QRShare';

interface AdminDashboardProps {
  roomData: RoomData;
  onUnlockBuzzers: () => void;
  onLockBuzzers: () => void;
  onResetRound: () => void;
  onNewRound: () => void;
  onUpdateAudioConfig: (newConfig: AudioConfig) => void;
  onKickTeam: (teamId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  roomData,
  onUnlockBuzzers,
  onLockBuzzers,
  onResetRound,
  onNewRound,
  onUpdateAudioConfig,
  onKickTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history' | 'audio'>('leaderboard');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const isBuzzerActive = roomData.state === 'active';
  const isBuzzerLocked = roomData.state === 'locked';

  return (
    <div className="min-h-[calc(100vh-60px)] w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner: Room Code & Quick Sharing */}
      <RoomCodeCard
        roomCode={roomData.roomCode}
        teamCount={roomData.teams.length}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Admin Action Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Round Info & State badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-cyan-400">Round</span>
              <span className="font-display font-black text-lg text-white leading-none">
                {roomData.roundNumber}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                  Round Controller
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isBuzzerActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : isBuzzerLocked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {roomData.state === 'active'
                    ? '● Active (Unlocked)'
                    : roomData.state === 'locked'
                    ? '■ Locked'
                    : '⏳ Waiting for Host'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBuzzerActive
                  ? 'Buzzers are currently active. Teams can tap now!'
                  : isBuzzerLocked
                  ? 'Buzzers are locked. Click "New Round" to log history and advance.'
                  : 'Click "Start Game" to unlock all buzzers simultaneously.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Start / Unlock Game */}
            <motion.button
              type="button"
              id="start-game-button"
              whileTap={{ scale: 0.96 }}
              onClick={onUnlockBuzzers}
              disabled={isBuzzerActive}
              className={`
                px-5 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition shadow-lg
                ${isBuzzerActive
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}
              `}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{roomData.buzzOrder.length > 0 ? 'Resume / Unlock' : 'Start Game (Unlock)'}</span>
            </motion.button>

            {/* Lock Buzzers */}
            <motion.button
              type="button"
              id="lock-buzzers-button"
              whileTap={{ scale: 0.96 }}
              onClick={onLockBuzzers}
              disabled={isBuzzerLocked}
              className={`
                px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition
                ${isBuzzerLocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm'}
              `}
            >
              <Lock className="w-4 h-4" />
              <span>Lock Buzzers</span>
            </motion.button>

            {/* Reset Round (clears buzzers for this round) */}
            <button
              type="button"
              id="reset-round-button"
              onClick={onResetRound}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5"
              title="Clear current buzzes and re-arm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Round</span>
            </button>

            {/* New Round (Archives previous and advances) */}
            <motion.button
              type="button"
              id="new-round-button"
              whileTap={{ scale: 0.96 }}
              onClick={onNewRound}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider transition flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>New Round</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Teams Panel), Right column (Leaderboard, History, Audio Tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Teams Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-4 flex flex-col h-full min-h-[420px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base tracking-wide uppercase text-white">
                  Live Teams ({roomData.teams.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Invite Teams</span>
              </button>
            </div>

            {roomData.teams.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-white/10 bg-black/20">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="font-display text-sm font-semibold uppercase tracking-wider text-slate-300">
                  No Teams Joined Yet
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  Share the room code <strong className="text-cyan-400">{roomData.roomCode}</strong> or open the QR code to let players join from their phones.
                </p>
                <button
                  type="button"
                  onClick={() => setIsQRModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show Join QR Code</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {roomData.teams.map((team) => {
                  const record = roomData.buzzOrder.find((b) => b.teamId === team.id);
                  return (
                    <TeamCard
                      key={team.id}
                      team={team}
                      buzzerRecord={record}
                      isHostView
                      onKick={onKickTeam}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabbed View (Leaderboard, History, Audio FX) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-4 flex flex-col h-full min-h-[420px]">
            {/* Tab Navigation Header */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className={`
                  px-3.5 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5
                  ${activeTab === 'leaderboard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Live Leaderboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`
                  px-3.5 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5
                  ${activeTab === 'history'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <History className="w-3.5 h-3.5" />
                <span>Round History ({roomData.history.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audio')}
                className={`
                  px-3.5 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5
                  ${activeTab === 'audio'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio FX</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex flex-col">
              {activeTab === 'leaderboard' && (
                <Leaderboard
                  buzzOrder={roomData.buzzOrder}
                  isLocked={roomData.state === 'locked'}
                />
              )}

              {activeTab === 'history' && (
                <RoundHistory
                  history={roomData.history}
                  roomCode={roomData.roomCode}
                />
              )}

              {activeTab === 'audio' && (
                <AudioUploader
                  config={roomData.audioConfig}
                  onUpdateConfig={onUpdateAudioConfig}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Share Modal */}
      <QRShare
        roomCode={roomData.roomCode}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
};
