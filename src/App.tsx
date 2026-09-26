/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, saveSession, loadSavedSession, clearSession } from './utils/socket';
import { RoomData, Team, AudioConfig, ClientSession } from './types';
import { unlockAudio, playBuzzerAudio } from './utils/sound';
import { TopBar } from './components/TopBar';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerScreen } from './components/PlayerScreen';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [view, setView] = useState<'landing' | 'admin' | 'player'>('landing');
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState('');

  const adminTokenRef = useRef<string | null>(null);

  // Check URL query parameters for direct room joining
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInitialRoomCode(roomParam.toLowerCase().trim());
      }
    }
  }, []);

  // Initialize Socket.io connection and listeners
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      setErrorMessage(null);

      // Attempt session restoration if saved
      const session = loadSavedSession();
      if (session?.roomCode) {
        if (session.isAdmin && session.adminToken) {
          socket.emit(
            'reconnect_admin',
            { roomCode: session.roomCode, adminToken: session.adminToken },
            (res: { success: boolean; roomData?: RoomData; error?: string }) => {
              if (res.success && res.roomData) {
                setRoomData(res.roomData);
                setIsAdmin(true);
                adminTokenRef.current = session.adminToken!;
                setView('admin');
              } else {
                clearSession();
              }
            }
          );
        } else if (session.teamId && session.teamName) {
          socket.emit(
            'join_room',
            {
              roomCode: session.roomCode,
              teamName: session.teamName,
              reconnectSessionId: session.teamId,
            },
            (res: { success: boolean; team?: Team; roomData?: RoomData; error?: string }) => {
              if (res.success && res.team && res.roomData) {
                setRoomData(res.roomData);
                setMyTeam(res.team);
                setIsAdmin(false);
                setView('player');
              } else {
                clearSession();
              }
            }
          );
        }
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onPlayerJoined = (payload: { team: Team; roomData: RoomData }) => {
      setRoomData(payload.roomData);
      // If this player is my team, sync local state
      setMyTeam((prev) => (prev?.id === payload.team.id ? payload.team : prev));
    };

    const onBuzzersUnlocked = (payload: { unlockedAt: number; roundNumber: number; roomData: RoomData }) => {
      setRoomData(payload.roomData);
    };

    const onBuzzersLocked = (payload: { roomData: RoomData }) => {
      setRoomData(payload.roomData);
    };

    const onUpdateLeaderboard = (payload: { buzzOrder: RoomData['buzzOrder']; isLocked: boolean; roomData: RoomData }) => {
      setRoomData(payload.roomData);
    };

    const onPlayAudio = (payload: { audioConfig: AudioConfig; winnerTeam: string }) => {
      playBuzzerAudio(payload.audioConfig);
    };

    const onResetRound = (payload: { roomData: RoomData }) => {
      setRoomData(payload.roomData);
    };

    const onRoomStateSync = (payload: { roomData: RoomData }) => {
      setRoomData(payload.roomData);
      // If my team was removed
      setMyTeam((prev) => {
        if (!prev) return null;
        const exists = payload.roomData.teams.some((t) => t.id === prev.id);
        if (!exists) {
          clearSession();
          setView('landing');
          setErrorMessage('You were removed from the room by the host.');
          return null;
        }
        return prev;
      });
    };

    const onAudioUpdated = (payload: { audioConfig: AudioConfig; roomData: RoomData }) => {
      setRoomData(payload.roomData);
    };

    const onPlayerLeft = (payload: { teamId?: string; isAdmin?: boolean; roomData: RoomData }) => {
      setRoomData(payload.roomData);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('player_joined', onPlayerJoined);
    socket.on('buzzers_unlocked', onBuzzersUnlocked);
    socket.on('buzzers_locked', onBuzzersLocked);
    socket.on('update_leaderboard', onUpdateLeaderboard);
    socket.on('play_audio', onPlayAudio);
    socket.on('reset_round', onResetRound);
    socket.on('room_state_sync', onRoomStateSync);
    socket.on('audio_updated', onAudioUpdated);
    socket.on('player_left', onPlayerLeft);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('player_joined', onPlayerJoined);
      socket.off('buzzers_unlocked', onBuzzersUnlocked);
      socket.off('buzzers_locked', onBuzzersLocked);
      socket.off('update_leaderboard', onUpdateLeaderboard);
      socket.off('play_audio', onPlayAudio);
      socket.off('reset_round', onResetRound);
      socket.off('room_state_sync', onRoomStateSync);
      socket.off('audio_updated', onAudioUpdated);
      socket.off('player_left', onPlayerLeft);
    };
  }, []);

  // Admin Actions
  const handleCreateRoom = useCallback(() => {
    unlockAudio();
    setIsLoading(true);
    setErrorMessage(null);
    const socket = getSocket();

    socket.emit(
      'create_room',
      (res: { success: boolean; roomCode?: string; adminToken?: string; roomData?: RoomData; error?: string }) => {
        setIsLoading(false);
        if (res.success && res.roomCode && res.adminToken && res.roomData) {
          setRoomData(res.roomData);
          setIsAdmin(true);
          adminTokenRef.current = res.adminToken;
          setView('admin');

          saveSession({
            roomCode: res.roomCode,
            isAdmin: true,
            adminToken: res.adminToken,
          });
        } else {
          setErrorMessage(res.error || 'Failed to create room. Please try again.');
        }
      }
    );
  }, []);

  const handleJoinRoom = useCallback((roomCode: string, teamName: string) => {
    unlockAudio();
    setIsLoading(true);
    setErrorMessage(null);
    const socket = getSocket();

    socket.emit(
      'join_room',
      { roomCode, teamName },
      (res: { success: boolean; team?: Team; roomData?: RoomData; error?: string }) => {
        setIsLoading(false);
        if (res.success && res.team && res.roomData) {
          setRoomData(res.roomData);
          setMyTeam(res.team);
          setIsAdmin(false);
          setView('player');

          saveSession({
            roomCode: res.roomData.roomCode,
            teamId: res.team.id,
            teamName: res.team.name,
            color: res.team.color,
            isAdmin: false,
          });
        } else {
          setErrorMessage(res.error || 'Failed to join room. Please check the code.');
        }
      }
    );
  }, []);

  const handleBuzz = useCallback(() => {
    if (!roomData || !myTeam || roomData.state !== 'active') return;
    unlockAudio();

    const clientTimestamp = Date.now();
    const socket = getSocket();

    socket.emit('buzz_triggered', {
      roomCode: roomData.roomCode,
      teamId: myTeam.id,
      clientTimestamp,
    });
  }, [roomData, myTeam]);

  const handleUnlockBuzzers = useCallback(() => {
    if (!roomData) return;
    unlockAudio();
    const socket = getSocket();
    socket.emit('unlock_buzzers', { roomCode: roomData.roomCode });
  }, [roomData]);

  const handleLockBuzzers = useCallback(() => {
    if (!roomData) return;
    const socket = getSocket();
    socket.emit('lock_buzzers', { roomCode: roomData.roomCode });
  }, [roomData]);

  const handleResetRound = useCallback(() => {
    if (!roomData) return;
    const socket = getSocket();
    socket.emit('reset_round', { roomCode: roomData.roomCode });
  }, [roomData]);

  const handleNewRound = useCallback(() => {
    if (!roomData) return;
    const socket = getSocket();
    socket.emit('new_round', { roomCode: roomData.roomCode });
  }, [roomData]);

  const handleUpdateAudioConfig = useCallback((newConfig: AudioConfig) => {
    if (!roomData) return;
    const socket = getSocket();
    socket.emit('update_audio_config', {
      roomCode: roomData.roomCode,
      audioConfig: newConfig,
    });
  }, [roomData]);

  const handleKickTeam = useCallback((teamId: string) => {
    if (!roomData) return;
    const socket = getSocket();
    socket.emit('kick_team', {
      roomCode: roomData.roomCode,
      teamId,
    });
  }, [roomData]);

  const handleExitRoom = useCallback(() => {
    clearSession();
    setView('landing');
    setRoomData(null);
    setMyTeam(null);
    setIsAdmin(false);
    adminTokenRef.current = null;
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* When in Player View: Render Dedicated Mobile Screen */}
      {view === 'player' && roomData && myTeam ? (
        <PlayerScreen
          roomData={roomData}
          myTeam={myTeam}
          isConnected={isConnected}
          onBuzz={handleBuzz}
          onLeave={handleExitRoom}
        />
      ) : (
        <>
          {/* Top Bar for Landing & Admin Views */}
          <TopBar
            roomCode={roomData?.roomCode}
            connectedTeamsCount={roomData?.teams.length ?? 0}
            isConnected={isConnected}
            audioConfig={roomData?.audioConfig}
            isAdmin={isAdmin}
            onExitRoom={view === 'admin' ? handleExitRoom : undefined}
          />

          {/* Body Content */}
          <main className="flex-1 flex flex-col">
            {view === 'admin' && roomData ? (
              <AdminDashboard
                roomData={roomData}
                onUnlockBuzzers={handleUnlockBuzzers}
                onLockBuzzers={handleLockBuzzers}
                onResetRound={handleResetRound}
                onNewRound={handleNewRound}
                onUpdateAudioConfig={handleUpdateAudioConfig}
                onKickTeam={handleKickTeam}
              />
            ) : (
              <LandingPage
                initialRoomCode={initialRoomCode}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                isLoading={isLoading}
                errorMessage={errorMessage}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
