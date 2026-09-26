export type RoomState = 'waiting' | 'active' | 'locked';

export interface TeamColor {
  id: string;
  name: string;
  hex: string;
  gradient: string;
  glow: string;
  textHex: string;
}

export const VIBRANT_TEAM_COLORS: TeamColor[] = [
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    hex: '#0066FF',
    gradient: 'from-[#0055ff] to-[#0099ff]',
    glow: 'rgba(0, 102, 255, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    hex: '#10B981',
    gradient: 'from-[#059669] to-[#10b981]',
    glow: 'rgba(16, 185, 129, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'electric-orange',
    name: 'Electric Orange',
    hex: '#FF5500',
    gradient: 'from-[#ea580c] to-[#f97316]',
    glow: 'rgba(255, 85, 0, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    hex: '#8B5CF6',
    gradient: 'from-[#7c3aed] to-[#a855f7]',
    glow: 'rgba(139, 92, 246, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'vibrant-pink',
    name: 'Vibrant Pink',
    hex: '#EC4899',
    gradient: 'from-[#db2777] to-[#f43f5e]',
    glow: 'rgba(236, 72, 153, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    hex: '#06B6D4',
    gradient: 'from-[#0891b2] to-[#06b6d4]',
    glow: 'rgba(6, 182, 212, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    hex: '#EF4444',
    gradient: 'from-[#dc2626] to-[#ef4444]',
    glow: 'rgba(239, 68, 68, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'amber-yellow',
    name: 'Volt Amber',
    hex: '#F59E0B',
    gradient: 'from-[#d97706] to-[#fbbf24]',
    glow: 'rgba(245, 158, 11, 0.6)',
    textHex: '#000000'
  },
  {
    id: 'violet-indigo',
    name: 'Deep Violet',
    hex: '#6366F1',
    gradient: 'from-[#4f46e5] to-[#6366f1]',
    glow: 'rgba(99, 102, 241, 0.6)',
    textHex: '#ffffff'
  },
  {
    id: 'toxic-lime',
    name: 'Toxic Lime',
    hex: '#84CC16',
    gradient: 'from-[#65a30d] to-[#84cc16]',
    glow: 'rgba(132, 204, 22, 0.6)',
    textHex: '#000000'
  }
];

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  isOnline: boolean;
  socketId: string;
  joinedAt: number;
}

export interface BuzzerRecord {
  teamId: string;
  teamName: string;
  color: TeamColor;
  buzzedAt: number; // absolute client/server reconciled ms
  diffMs: number;   // +0ms for 1st, +12ms for 2nd, etc.
  rank: number;     // 1, 2, 3...
}

export interface RoundHistoryItem {
  roundNumber: number;
  timestamp: number;
  winnerTeam: string;
  winnerColor: TeamColor;
  buzzOrder: BuzzerRecord[];
}

export interface AudioConfig {
  presetId: 'esports-horn' | 'digital-zap' | 'laser-strike' | 'game-show' | 'custom';
  name: string;
  customAudioData?: string; // base64 data url
  customAudioName?: string;
  volume: number; // 0 to 1
}

export interface RoomData {
  roomCode: string;
  state: RoomState;
  roundNumber: number;
  teams: Team[];
  buzzOrder: BuzzerRecord[];
  history: RoundHistoryItem[];
  audioConfig: AudioConfig;
  adminConnected: boolean;
  unlockedAt: number | null;
}

export interface ClientSession {
  roomCode: string;
  teamId?: string;
  teamName?: string;
  color?: TeamColor;
  isAdmin?: boolean;
  adminToken?: string;
}
