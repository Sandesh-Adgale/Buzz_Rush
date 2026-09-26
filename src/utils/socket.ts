import { io, Socket } from 'socket.io-client';
import { RoomData, Team, BuzzerRecord, AudioConfig, ClientSession } from '../types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(typeof window !== 'undefined' ? window.location.origin : '', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
    });
  }
  return socket;
}

// Session persistence helpers
const SESSION_STORAGE_KEY = 'buzzrush_client_session';

export function saveSession(session: ClientSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage issues
  }
}

export function loadSavedSession(): ClientSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
