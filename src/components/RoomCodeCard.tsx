import React, { useState } from 'react';
import { Copy, Check, QrCode, Share2, Users } from 'lucide-react';

interface RoomCodeCardProps {
  roomCode: string;
  teamCount: number;
  onOpenQR: () => void;
}

export const RoomCodeCard: React.FC<RoomCodeCardProps> = ({
  roomCode,
  teamCount,
  onOpenQR,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getJoinUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}?room=${roomCode}`;
    }
    return `https://buzzrush.app/join/${roomCode}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareLink = async () => {
    const url = getJoinUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BuzzRush Room',
          text: `Join our buzzer room with code: ${roomCode}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl p-4 sm:p-5 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      {/* Background neon ambient highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Code info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Active Room Code
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {teamCount} {teamCount === 1 ? 'Team' : 'Teams'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display font-black text-3xl sm:text-4xl tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {roomCode}
            </span>

            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Copy Room Code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQR}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>QR Join</span>
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10 transition flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
