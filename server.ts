import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';

// Vibrant Team Colors palette
const VIBRANT_TEAM_COLORS = [
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    hex: '#0066FF',
    gradient: 'from-[#0055ff] to-[#0099ff]',
    glow: 'rgba(0, 102, 255, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    hex: '#10B981',
    gradient: 'from-[#059669] to-[#10b981]',
    glow: 'rgba(16, 185, 129, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'electric-orange',
    name: 'Electric Orange',
    hex: '#FF5500',
    gradient: 'from-[#ea580c] to-[#f97316]',
    glow: 'rgba(255, 85, 0, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    hex: '#8B5CF6',
    gradient: 'from-[#7c3aed] to-[#a855f7]',
    glow: 'rgba(139, 92, 246, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'vibrant-pink',
    name: 'Vibrant Pink',
    hex: '#EC4899',
    gradient: 'from-[#db2777] to-[#f43f5e]',
    glow: 'rgba(236, 72, 153, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    hex: '#06B6D4',
    gradient: 'from-[#0891b2] to-[#06b6d4]',
    glow: 'rgba(6, 182, 212, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    hex: '#EF4444',
    gradient: 'from-[#dc2626] to-[#ef4444]',
    glow: 'rgba(239, 68, 68, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'amber-yellow',
    name: 'Volt Amber',
    hex: '#F59E0B',
    gradient: 'from-[#d97706] to-[#fbbf24]',
    glow: 'rgba(245, 158, 11, 0.6)',
    textHex: '#000000',
  },
  {
    id: 'violet-indigo',
    name: 'Deep Violet',
    hex: '#6366F1',
    gradient: 'from-[#4f46e5] to-[#6366f1]',
    glow: 'rgba(99, 102, 241, 0.6)',
    textHex: '#ffffff',
  },
  {
    id: 'toxic-lime',
    name: 'Toxic Lime',
    hex: '#84CC16',
    gradient: 'from-[#65a30d] to-[#84cc16]',
    glow: 'rgba(132, 204, 22, 0.6)',
    textHex: '#000000',
  },
];

interface Team {
  id: string;
  name: string;
  color: typeof VIBRANT_TEAM_COLORS[0];
  isOnline: boolean;
  socketId: string;
  joinedAt: number;
}

interface BuzzerRecord {
  teamId: string;
  teamName: string;
  color: typeof VIBRANT_TEAM_COLORS[0];
  buzzedAt: number;
  diffMs: number;
  rank: number;
}

interface RoundHistoryItem {
  roundNumber: number;
  timestamp: number;
  winnerTeam: string;
  winnerColor: typeof VIBRANT_TEAM_COLORS[0];
  buzzOrder: BuzzerRecord[];
}

interface AudioConfig {
  presetId: 'esports-horn' | 'digital-zap' | 'laser-strike' | 'game-show' | 'custom';
  name: string;
  customAudioData?: string;
  customAudioName?: string;
  volume: number;
}

interface Room {
  roomCode: string;
  adminToken: string;
  adminSocketId: string;
  state: 'waiting' | 'active' | 'locked';
  roundNumber: number;
  teams: Map<string, Team>;
  buzzOrder: BuzzerRecord[];
  history: RoundHistoryItem[];
  audioConfig: AudioConfig;
  unlockedAt: number | null;
  createdAt: number;
}

// Generate unique 5-character lowercase code e.g. 11hhw
function generateRoomCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Redis-ready in-memory store
class RoomStore {
  private rooms: Map<string, Room> = new Map();

  createRoom(adminSocketId: string): { roomCode: string; adminToken: string; room: Room } {
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const adminToken = 'adm_' + Math.random().toString(36).substring(2, 15);
    const room: Room = {
      roomCode,
      adminToken,
      adminSocketId,
      state: 'waiting',
      roundNumber: 1,
      teams: new Map(),
      buzzOrder: [],
      history: [],
      audioConfig: {
        presetId: 'esports-horn',
        name: 'Esports Arena Horn',
        volume: 0.8,
      },
      unlockedAt: null,
      createdAt: Date.now(),
    };

    this.rooms.set(roomCode, room);
    return { roomCode, adminToken, room };
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toLowerCase().trim());
  }

  deleteRoom(roomCode: string): boolean {
    return this.rooms.delete(roomCode.toLowerCase().trim());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  serializeRoom(room: Room) {
    return {
      roomCode: room.roomCode,
      state: room.state,
      roundNumber: room.roundNumber,
      teams: Array.from(room.teams.values()),
      buzzOrder: room.buzzOrder,
      history: room.history,
      audioConfig: room.audioConfig,
      adminConnected: Boolean(room.adminSocketId),
      unlockedAt: room.unlockedAt,
    };
  }
}

const store = new RoomStore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: store.getRoomCount(),
      timestamp: Date.now(),
    });
  });

  app.get('/api/rooms/:code', (req, res) => {
    const room = store.getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(store.serializeRoom(room));
  });

  const server = http.createServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    maxHttpBufferSize: 1e7, // 10MB
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  // Socket.IO real-time event handlers
  io.on('connection', (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentTeamId: string | null = null;
    let isAdmin = false;

    // 1. Create Room (Admin)
    socket.on('create_room', (callback) => {
      try {
        const { roomCode, adminToken, room } = store.createRoom(socket.id);
        currentRoomCode = roomCode;
        isAdmin = true;

        socket.join(`room:${roomCode}`);

        if (typeof callback === 'function') {
          callback({
            success: true,
            roomCode,
            adminToken,
            roomData: store.serializeRoom(room),
          });
        }
      } catch (err) {
        console.error('Create room error:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to create room' });
        }
      }
    });

    // 2. Re-authenticate Admin (upon reconnect / page refresh)
    socket.on('reconnect_admin', ({ roomCode, adminToken }, callback) => {
      const room = store.getRoom(roomCode);
      if (!room || room.adminToken !== adminToken) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Invalid admin credentials or room expired' });
        }
        return;
      }

      room.adminSocketId = socket.id;
      currentRoomCode = room.roomCode;
      isAdmin = true;
      socket.join(`room:${room.roomCode}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomData: store.serializeRoom(room),
        });
      }
    });

    // 3. Join Room (Player)
    socket.on('join_room', ({ roomCode, teamName, reconnectSessionId }, callback) => {
      const cleanCode = (roomCode || '').toLowerCase().trim();
      const cleanName = (teamName || '').trim();

      const room = store.getRoom(cleanCode);
      if (!room) {
        if (typeof callback === 'function') {
          callback({
            success: false,
            error: `Room "${cleanCode}" not found. Please verify the 5-character code.`,
          });
        }
        return;
      }

      // Check if this team is reconnecting
      let existingTeam: Team | undefined;
      if (reconnectSessionId && room.teams.has(reconnectSessionId)) {
        existingTeam = room.teams.get(reconnectSessionId);
      } else {
        // Find by name
        for (const t of room.teams.values()) {
          if (t.name.toLowerCase() === cleanName.toLowerCase()) {
            existingTeam = t;
            break;
          }
        }
      }

      let team: Team;

      if (existingTeam) {
        // Re-attach socket to existing team
        existingTeam.socketId = socket.id;
        existingTeam.isOnline = true;
        team = existingTeam;
      } else {
        // Check duplicate name
        for (const t of room.teams.values()) {
          if (t.name.toLowerCase() === cleanName.toLowerCase() && t.isOnline) {
            if (typeof callback === 'function') {
              callback({
                success: false,
                error: `Team name "${cleanName}" is already active in this room. Please choose another name.`,
              });
            }
            return;
          }
        }

        // Assign vibrant color cyclically
        const assignedColor = VIBRANT_TEAM_COLORS[room.teams.size % VIBRANT_TEAM_COLORS.length];
        const teamId = reconnectSessionId || 'tm_' + Math.random().toString(36).substring(2, 10);

        team = {
          id: teamId,
          name: cleanName,
          color: assignedColor,
          isOnline: true,
          socketId: socket.id,
          joinedAt: Date.now(),
        };

        room.teams.set(teamId, team);
      }

      currentRoomCode = room.roomCode;
      currentTeamId = team.id;
      socket.join(`room:${room.roomCode}`);

      // Broadcast to all room members
      io.to(`room:${room.roomCode}`).emit('player_joined', {
        team,
        roomData: store.serializeRoom(room),
      });

      if (typeof callback === 'function') {
        callback({
          success: true,
          team,
          roomData: store.serializeRoom(room),
        });
      }
    });

    // 4. Unlock Buzzers (Admin starts round)
    socket.on('unlock_buzzers', ({ roomCode }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      room.state = 'active';
      room.buzzOrder = [];
      room.unlockedAt = Date.now();

      io.to(`room:${room.roomCode}`).emit('buzzers_unlocked', {
        unlockedAt: room.unlockedAt,
        roundNumber: room.roundNumber,
        roomData: store.serializeRoom(room),
      });
    });

    // 5. Lock Buzzers (Admin locks buzzers)
    socket.on('lock_buzzers', ({ roomCode }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      room.state = 'locked';

      io.to(`room:${room.roomCode}`).emit('buzzers_locked', {
        roomData: store.serializeRoom(room),
      });
    });

    // 6. Player Taps Buzzer
    socket.on('buzz_triggered', ({ roomCode, teamId, clientTimestamp }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      // Only accept buzzes if round is active
      if (room.state !== 'active') return;

      const team = room.teams.get(teamId);
      if (!team) return;

      // Check if team already buzzed in this round
      const alreadyBuzzed = room.buzzOrder.some((b) => b.teamId === teamId);
      if (alreadyBuzzed) return;

      const tapTime = typeof clientTimestamp === 'number' && clientTimestamp > 0
        ? clientTimestamp
        : Date.now();

      const isFirst = room.buzzOrder.length === 0;
      const firstBuzzedAt = isFirst ? tapTime : room.buzzOrder[0].buzzedAt;
      const diffMs = isFirst ? 0 : Math.max(0, tapTime - firstBuzzedAt);
      const rank = room.buzzOrder.length + 1;

      const record: BuzzerRecord = {
        teamId: team.id,
        teamName: team.name,
        color: team.color,
        buzzedAt: tapTime,
        diffMs,
        rank,
      };

      room.buzzOrder.push(record);

      // Lock buzzers after the first buzz (as specified in specs), but capture queued hits
      room.state = 'locked';

      // Play audio across the room on first buzz
      if (isFirst) {
        io.to(`room:${room.roomCode}`).emit('play_audio', {
          audioConfig: room.audioConfig,
          winnerTeam: team.name,
        });
      }

      // Broadcast updated leaderboard and locked state
      io.to(`room:${room.roomCode}`).emit('update_leaderboard', {
        buzzOrder: room.buzzOrder,
        isLocked: true,
        roomData: store.serializeRoom(room),
      });
    });

    // 7. Reset Round (Admin clears current buzzes so teams can buzz again)
    socket.on('reset_round', ({ roomCode }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      room.state = 'waiting';
      room.buzzOrder = [];
      room.unlockedAt = null;

      io.to(`room:${room.roomCode}`).emit('reset_round', {
        roomData: store.serializeRoom(room),
      });
    });

    // 8. New Round (Admin archives previous round and starts next)
    socket.on('new_round', ({ roomCode }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      // Archive current round if it had buzzes
      if (room.buzzOrder.length > 0) {
        const winner = room.buzzOrder[0];
        room.history.push({
          roundNumber: room.roundNumber,
          timestamp: Date.now(),
          winnerTeam: winner.teamName,
          winnerColor: winner.color,
          buzzOrder: [...room.buzzOrder],
        });
      }

      room.roundNumber += 1;
      room.state = 'waiting';
      room.buzzOrder = [];
      room.unlockedAt = null;

      io.to(`room:${room.roomCode}`).emit('room_state_sync', {
        roomData: store.serializeRoom(room),
      });
    });

    // 9. Update Audio Config (Admin)
    socket.on('update_audio_config', ({ roomCode, audioConfig }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      room.audioConfig = {
        ...room.audioConfig,
        ...audioConfig,
      };

      io.to(`room:${room.roomCode}`).emit('audio_updated', {
        audioConfig: room.audioConfig,
        roomData: store.serializeRoom(room),
      });
    });

    // 10. Kick / Remove Team (Admin)
    socket.on('kick_team', ({ roomCode, teamId }) => {
      const room = store.getRoom(roomCode);
      if (!room) return;

      room.teams.delete(teamId);
      room.buzzOrder = room.buzzOrder.filter((b) => b.teamId !== teamId);

      io.to(`room:${room.roomCode}`).emit('room_state_sync', {
        roomData: store.serializeRoom(room),
      });
    });

    // 11. Disconnect Handling
    socket.on('disconnect', () => {
      if (currentRoomCode) {
        const room = store.getRoom(currentRoomCode);
        if (room) {
          if (isAdmin) {
            room.adminSocketId = '';
            io.to(`room:${room.roomCode}`).emit('player_left', {
              isAdmin: true,
              roomData: store.serializeRoom(room),
            });
          } else if (currentTeamId) {
            const team = room.teams.get(currentTeamId);
            if (team) {
              team.isOnline = false;
              io.to(`room:${room.roomCode}`).emit('player_left', {
                teamId: currentTeamId,
                roomData: store.serializeRoom(room),
              });
            }
          }
        }
      }
    });
  });

  // Vite Middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`BuzzRush Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
