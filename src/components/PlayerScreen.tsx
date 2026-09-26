import React from 'react';
import { motion } from 'motion/react';
import { BuzzerButton } from './BuzzerButton';
import { Team, RoomData } from '../types';
import { Wifi, WifiOff, Users, ArrowLeft } from 'lucide-react';

interface PlayerScreenProps {
  roomData: RoomData;
  myTeam: Team;
  isConnected: boolean;
  onBuzz: () => void;
  onLeave: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  roomData,
  myTeam,
  isConnected,
  onBuzz,
  onLeave,
}) => {
  // Find player's buzz record in current round
  const myBuzzRecord = roomData.buzzOrder.find((b) => b.teamId === myTeam.id);

  return (
    <div
      className="min-h-screen w-full flex flex-col transition-colors duration-700 relative overflow-hidden"
      style={{
        backgroundColor: myTeam.color.hex,
      }}
    >
      {/* Subtle overlay gradient to give depth while keeping team color dominant */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45 pointer-events-none" />

      {/* Top Mobile Bar */}
      <header className="relative z-20 px-4 py-3 flex items-center justify-between bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLeave}
            className="p-1.5 rounded-lg bg-black/40 text-white/80 hover:text-white border border-white/15 transition"
            title="Leave Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg text-white tracking-wide">
                {myTeam.name}
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40"
                style={{ backgroundColor: myTeam.color.hex }}
              />
            </div>
            <span className="text-[11px] text-white/70 block -mt-0.5">
              Room: <strong className="font-mono text-white tracking-widest">{roomData.roomCode}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-white/80" />
            <span>{roomData.teams.length} Teams</span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-400/30 animate-pulse'
            }`}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="text-[11px]">{isConnected ? 'Live' : 'Reconnecting'}</span>
          </div>
        </div>
      </header>

      {/* Main Center Area: Massive Buzzer Button */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto">
        <BuzzerButton
          state={roomData.state}
          teamColor={myTeam.color}
          onBuzz={onBuzz}
          myRank={myBuzzRecord?.rank}
          myDiffMs={myBuzzRecord?.diffMs}
          roundNumber={roomData.roundNumber}
        />
      </main>

      {/* Bottom info footer */}
      <footer className="relative z-20 px-4 py-2.5 text-center bg-black/40 backdrop-blur-md border-t border-white/10 text-[11px] text-white/80 font-medium">
        <span>Assigned Team Color: </span>
        <strong className="text-white font-bold">{myTeam.color.name}</strong>
        <span className="mx-2">•</span>
        <span>Round {roomData.roundNumber}</span>
      </footer>
    </div>
  );
};
