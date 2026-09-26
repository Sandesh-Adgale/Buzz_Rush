import React from 'react';
import { motion } from 'motion/react';
import { Wifi, WifiOff, CheckCircle2, Clock } from 'lucide-react';
import { Team, BuzzerRecord } from '../types';

interface TeamCardProps {
  team: Team;
  buzzerRecord?: BuzzerRecord;
  isHostView?: boolean;
  onKick?: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  buzzerRecord,
  isHostView,
  onKick,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md p-3.5 flex items-center justify-between group shadow-sm hover:border-white/20 transition-all"
    >
      {/* Team Color Left Strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 shadow-[0_0_12px]"
        style={{
          backgroundColor: team.color.hex,
          boxShadow: `0 0 10px ${team.color.glow}`,
        }}
      />

      {/* Team Details */}
      <div className="flex items-center gap-3 pl-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs uppercase shadow-sm border border-white/20"
          style={{
            backgroundColor: team.color.hex,
            color: team.color.textHex,
          }}
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-wide">
              {team.name}
            </span>
            {team.isOnline ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <WifiOff className="w-2.5 h-2.5" />
                Away
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Color: <span style={{ color: team.color.hex }}>{team.color.name}</span>
          </span>
        </div>
      </div>

      {/* Right side: Buzz Status or Kick */}
      <div className="flex items-center gap-2">
        {buzzerRecord ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>#{buzzerRecord.rank}</span>
            <span className="text-[10px] text-slate-400">
              {buzzerRecord.diffMs === 0 ? '0ms' : `+${buzzerRecord.diffMs}ms`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Ready</span>
          </div>
        )}

        {isHostView && onKick && (
          <button
            type="button"
            onClick={() => onKick(team.id)}
            title="Remove Team"
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition text-xs"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
};
