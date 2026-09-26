import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Zap, Lock, Clock, Trophy } from 'lucide-react';
import { TeamColor } from '../types';

interface BuzzerButtonProps {
  state: 'waiting' | 'active' | 'locked';
  teamColor: TeamColor;
  onBuzz: () => void;
  myRank?: number | null;
  myDiffMs?: number | null;
  roundNumber: number;
}

export const BuzzerButton: React.FC<BuzzerButtonProps> = ({
  state,
  teamColor,
  onBuzz,
  myRank,
  myDiffMs,
  roundNumber,
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (state !== 'active') return;

    // Trigger haptic vibration on mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 20, 40]);
      } catch {
        // Ignored if device doesn't support vibration
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 900);

    onBuzz();
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full flex-1 p-4 select-none touch-manipulation">
      {/* State Status Banner */}
      <motion.div
        key={state + (myRank ?? '')}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-center z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/90 shadow-lg">
          {state === 'waiting' && (
            <>
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Round {roundNumber} • Host preparing...</span>
            </>
          )}
          {state === 'active' && (
            <>
              <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-emerald-300 font-bold">Round {roundNumber} Live • BUZZERS OPEN!</span>
            </>
          )}
          {state === 'locked' && (
            <>
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Round {roundNumber} • Round Concluded</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Buzzer Outer Ring & Pulsing Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-square flex items-center justify-center">
        {/* Pulsing ambient rings in active state */}
        {state === 'active' && (
          <>
            <motion.div
              animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full blur-xl pointer-events-none"
              style={{ backgroundColor: teamColor.glow }}
            />
            <div
              className="absolute -inset-4 rounded-full opacity-60 animate-buzzer-ripple pointer-events-none"
              style={{ border: `3px solid ${teamColor.hex}` }}
            />
          </>
        )}

        {/* Main Massive Button */}
        <motion.button
          id="massive-buzzer-button"
          type="button"
          disabled={state !== 'active'}
          onPointerDown={handlePointerDown}
          whileTap={state === 'active' ? { scale: 0.94 } : {}}
          className={`
            relative w-[88%] h-[88%] rounded-full flex flex-col items-center justify-center
            font-display font-extrabold transition-all duration-300 shadow-2xl overflow-hidden
            cursor-pointer disabled:cursor-not-allowed select-none
            ${state === 'active'
              ? 'ring-8 ring-white/40 border-4 border-white active:ring-white/80 active:border-white shadow-[0_0_60px_rgba(255,255,255,0.4)]'
              : state === 'locked'
              ? 'ring-4 ring-rose-500/30 border border-black/40 opacity-90'
              : 'ring-4 ring-white/10 border border-white/10 opacity-70'}
          `}
          style={{
            backgroundColor: state === 'active' ? '#ffffff' : state === 'locked' ? '#111827' : '#1e293b',
            color: state === 'active' ? teamColor.hex : '#94a3b8',
          }}
        >
          {/* Radial depth inner shadow */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: state === 'active'
                ? `radial-gradient(circle at 50% 35%, rgba(255,255,255,1) 0%, rgba(240,240,240,0.85) 60%, ${teamColor.hex}22 100%)`
                : 'radial-gradient(circle at 50% 35%, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.95) 100%)',
              boxShadow: state === 'active'
                ? `inset 0 -12px 25px rgba(0,0,0,0.18), inset 0 8px 18px rgba(255,255,255,0.9)`
                : `inset 0 -8px 20px rgba(0,0,0,0.8)`,
            }}
          />

          {/* Ripples on tap */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full pointer-events-none bg-black/20 animate-ping"
              style={{
                left: ripple.x - 60,
                top: ripple.y - 60,
                width: 120,
                height: 120,
              }}
            />
          ))}

          {/* Central Button Content based on state */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            {state === 'waiting' && (
              <>
                <Clock className="w-12 h-12 mb-3 text-slate-400 animate-pulse" />
                <span className="text-xl sm:text-2xl tracking-wider text-slate-300 font-bold uppercase">
                  Waiting for Host...
                </span>
                <span className="text-xs text-slate-400 mt-2">Get ready to tap when unlocked!</span>
              </>
            )}

            {state === 'active' && (
              <>
                <Zap className="w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-md animate-pulse" style={{ color: teamColor.hex }} />
                <span className="text-3xl sm:text-4xl tracking-tight leading-none uppercase font-black drop-shadow-sm" style={{ color: teamColor.hex }}>
                  TAP TO BUZZ
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-slate-600 mt-2 uppercase">
                  Fastest Finger Wins
                </span>
              </>
            )}

            {state === 'locked' && (
              <>
                {myRank !== undefined && myRank !== null ? (
                  <div className="flex flex-col items-center">
                    <Trophy
                      className={`w-12 h-12 mb-2 ${
                        myRank === 1 ? 'text-amber-400' : myRank === 2 ? 'text-slate-300' : 'text-amber-600'
                      }`}
                    />
                    <span className="text-3xl sm:text-4xl font-extrabold uppercase text-white font-mono-numbers">
                      {myRank === 1 ? '🥇 1st Place!' : myRank === 2 ? '🥈 2nd Place!' : myRank === 3 ? '🥉 3rd Place!' : `#${myRank} Place`}
                    </span>
                    <span className="text-sm font-bold text-slate-300 mt-1 font-mono-numbers">
                      {myDiffMs === 0 ? 'First to Buzz (0ms)' : `+${myDiffMs} ms`}
                    </span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-12 h-12 mb-3 text-rose-400" />
                    <span className="text-2xl sm:text-3xl tracking-wider text-rose-400 font-bold uppercase">
                      Buzz Locked
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Round ended or locked</span>
                  </>
                )}
              </>
            )}
          </div>
        </motion.button>
      </div>

      {/* Bottom helper tip */}
      <div className="mt-6 text-center text-xs text-white/70 max-w-xs px-2 drop-shadow">
        {state === 'active'
          ? '⚡ Tap anywhere inside the circle as fast as you can!'
          : state === 'waiting'
          ? 'Keep your finger close to the screen'
          : 'Wait for the host to start the next round'}
      </div>
    </div>
  );
};
