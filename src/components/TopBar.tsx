import React, { useState } from 'react';
import { Wifi, WifiOff, Volume2, Users, Download, ArrowLeft, Shield } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AudioConfig } from '../types';

interface TopBarProps {
  roomCode?: string;
  connectedTeamsCount: number;
  isConnected: boolean;
  audioConfig?: AudioConfig;
  isAdmin?: boolean;
  onExitRoom?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomCode,
  connectedTeamsCount,
  isConnected,
  audioConfig,
  isAdmin,
  onExitRoom,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070b14]/85 backdrop-blur-xl px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Room indicator */}
        <div className="flex items-center gap-3">
          {onExitRoom && (
            <button
              type="button"
              onClick={onExitRoom}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition"
              title="Leave Room"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center font-display font-black text-cyan-400 text-sm">
                BR
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-base text-white tracking-wider">
                  BUZZ<span className="text-cyan-400">RUSH</span>
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> HOST
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                Real-Time Team Buzzer
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Room Pills (when in room) */}
        {roomCode && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 flex items-center gap-2 text-xs">
              <span className="text-slate-400">ROOM:</span>
              <span className="font-display font-black text-cyan-400 tracking-wider">
                {roomCode}
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 flex items-center gap-1.5 text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{connectedTeamsCount} Active</span>
            </div>
          </div>
        )}

        {/* Right: Status Indicators & PWA Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio status pill */}
          {audioConfig && (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-[11px] text-slate-300"
              title={`Audio: ${audioConfig.name}`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[110px]">{audioConfig.name}</span>
            </div>
          )}

          {/* Connection Status indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Reconnecting...</span>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-90 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              type="button"
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS PWA Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/20 p-5 shadow-2xl text-left">
            <h3 className="text-base font-bold text-white mb-2">Install BuzzRush on iOS</h3>
            <p className="text-xs text-slate-300 space-y-1 mb-4">
              1. Tap the <strong className="text-cyan-400">Share</strong> icon in Safari&apos;s bottom toolbar.<br />
              2. Scroll down and choose <strong className="text-cyan-400">Add to Home Screen</strong>.<br />
              3. Launch BuzzRush directly from your home screen for full-screen low-latency buzzing!
            </p>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
