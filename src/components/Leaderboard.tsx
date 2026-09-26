import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Clock } from 'lucide-react';
import { BuzzerRecord } from '../types';

interface LeaderboardProps {
  buzzOrder: BuzzerRecord[];
  isLocked: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ buzzOrder, isLocked }) => {
  const previousWinnerRef = useRef<string | null>(null);

  useEffect(() => {
    if (buzzOrder.length > 0) {
      const currentWinner = buzzOrder[0]?.teamId;
      if (currentWinner && currentWinner !== previousWinnerRef.current) {
        previousWinnerRef.current = currentWinner;
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#ffd700', '#ff0055', '#10b981', '#a855f7'],
          });
        } catch {
          // ignore if canvas unavailable
        }
      }
    } else {
      previousWinnerRef.current = null;
    }
  }, [buzzOrder]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: '🥇',
          label: '1st',
          cardStyle: 'border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.25)]',
          badgeStyle: 'bg-amber-400 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.6)]',
          glowBorder: 'ring-1 ring-amber-400/40',
        };
      case 2:
        return {
          icon: '🥈',
          label: '2nd',
          cardStyle: 'border-slate-300/50 bg-gradient-to-r from-slate-400/15 via-slate-300/5 to-transparent shadow-[0_0_20px_rgba(203,213,225,0.15)]',
          badgeStyle: 'bg-slate-300 text-slate-900 font-extrabold shadow-[0_0_10px_rgba(203,213,225,0.4)]',
          glowBorder: 'ring-1 ring-slate-300/30',
        };
      case 3:
        return {
          icon: '🥉',
          label: '3rd',
          cardStyle: 'border-amber-700/50 bg-gradient-to-r from-amber-700/20 via-amber-600/5 to-transparent shadow-[0_0_20px_rgba(180,83,9,0.15)]',
          badgeStyle: 'bg-amber-600 text-white font-extrabold shadow-[0_0_10px_rgba(180,83,9,0.4)]',
          glowBorder: 'ring-1 ring-amber-600/30',
        };
      default:
        return {
          icon: `${rank}`,
          label: `${rank}th`,
          cardStyle: 'border-white/10 bg-slate-900/60',
          badgeStyle: 'bg-slate-800 text-slate-300 font-bold border border-white/10',
          glowBorder: '',
        };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-bold text-base tracking-wide uppercase text-white">
            Live Round Results
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {buzzOrder.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {buzzOrder.length} Buzzed
            </span>
          )}
          {isLocked && buzzOrder.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Round Final
            </span>
          )}
        </div>
      </div>

      {buzzOrder.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-white/10 bg-black/20">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-slate-300">
            Awaiting Buzz Trigger
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
            When players buzz, their placement and millisecond precision will appear instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {buzzOrder.map((record, index) => {
              const badge = getRankBadge(record.rank);
              const timeString = new Date(record.buzzedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3,
              });

              return (
                <motion.div
                  key={record.teamId}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  className={`
                    relative flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md transition-all
                    ${badge.cardStyle} ${badge.glowBorder}
                  `}
                >
                  {/* Left: Rank & Team Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0
                        ${badge.badgeStyle}
                      `}
                    >
                      {badge.icon}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: record.color.hex }}
                        />
                        <span className="font-bold text-base text-white tracking-wide">
                          {record.teamName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {timeString}
                      </span>
                    </div>
                  </div>

                  {/* Right: Difference from first place */}
                  <div className="text-right">
                    <div
                      className={`font-mono-numbers font-bold text-sm tracking-tight ${
                        record.rank === 1
                          ? 'text-amber-400 font-extrabold text-base'
                          : 'text-cyan-300'
                      }`}
                    >
                      {record.diffMs === 0 ? '0 ms' : `+${record.diffMs} ms`}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                      {record.rank === 1 ? 'FASTEST' : 'SPLIT TIME'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
