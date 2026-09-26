import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, QrCode as QrIcon, ExternalLink } from 'lucide-react';

interface QRShareProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRShare: React.FC<QRShareProps> = ({ roomCode, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?room=${roomCode}`
    : `https://buzzrush.app/join/${roomCode}`;

  useEffect(() => {
    if (isOpen && roomCode) {
      QRCode.toDataURL(joinUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#070b14',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, roomCode, joinUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `buzzrush-room-${roomCode}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-cyan-500/30 bg-[#0c1220] p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-2">
            <QrIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="font-display font-black text-xl text-white tracking-wider uppercase">
            Scan to Join
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Players can point their phone camera to jump right in
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative p-4 rounded-2xl bg-white mx-auto shadow-inner w-fit">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for Room ${roomCode}`}
              className="w-56 h-56 object-contain rounded-lg"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-500">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Room Code highlight */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
          <div className="text-left pl-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Room Code</div>
            <div className="font-display font-extrabold text-xl text-cyan-400 tracking-widest">{roomCode}</div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
