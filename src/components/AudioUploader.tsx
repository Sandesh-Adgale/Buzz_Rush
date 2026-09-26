import React, { useRef, useState } from 'react';
import { Volume2, Upload, Play, CheckCircle, Music, RefreshCw, AlertCircle } from 'lucide-react';
import { AudioConfig } from '../types';
import { playBuzzerAudio, playPresetSound } from '../utils/sound';

interface AudioUploaderProps {
  config: AudioConfig;
  onUpdateConfig: (newConfig: AudioConfig) => void;
}

const PRESETS: { id: AudioConfig['presetId']; label: string; desc: string }[] = [
  { id: 'esports-horn', label: 'Esports Arena Horn', desc: 'Powerful stadium brass blast' },
  { id: 'digital-zap', label: 'Cyber Pulse', desc: 'Electronic sci-fi rapid pulse' },
  { id: 'laser-strike', label: 'Laser Strike', desc: 'High-frequency arcade beam' },
  { id: 'game-show', label: 'Classic Game Show', desc: 'Dual-tone broadcast chime' },
];

export const AudioUploader: React.FC<AudioUploaderProps> = ({ config, onUpdateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Check size limit: 3MB max
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Audio file must be under 3MB');
      return;
    }

    // Check audio types
    if (!file.type.startsWith('audio/')) {
      setUploadError('Please select a valid audio file (MP3, WAV, OGG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;

      // Check audio duration
      const tempAudio = new Audio(dataUri);
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration > 4.5) {
          setUploadError(`Audio is ${Math.round(tempAudio.duration)}s. Recommended is ≤ 2s.`);
        }
        onUpdateConfig({
          presetId: 'custom',
          name: file.name,
          customAudioData: dataUri,
          customAudioName: file.name,
          volume: config.volume,
        });
      };
      tempAudio.onerror = () => {
        setUploadError('Failed to decode audio file. Try MP3 or WAV format.');
      };
    };
    reader.onerror = () => {
      setUploadError('Error reading uploaded file');
    };
    reader.readAsDataURL(file);
  };

  const handlePlayPreview = () => {
    setIsPlayingPreview(true);
    playBuzzerAudio(config);
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, 2000);
  };

  const handleSelectPreset = (presetId: AudioConfig['presetId']) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    onUpdateConfig({
      presetId,
      name: preset ? preset.label : 'Custom Sound',
      customAudioData: presetId === 'custom' ? config.customAudioData : undefined,
      customAudioName: presetId === 'custom' ? config.customAudioName : undefined,
      volume: config.volume,
    });
    playPresetSound(presetId, config.volume);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <h4 className="font-display font-bold text-sm tracking-wide uppercase text-white">
            Buzzer Audio FX
          </h4>
        </div>

        <button
          type="button"
          onClick={handlePlayPreview}
          disabled={isPlayingPreview}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-cyan-300" />
          <span>{isPlayingPreview ? 'Playing...' : 'Test Play'}</span>
        </button>
      </div>

      {/* Preset grid selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESETS.map((preset) => {
          const isSelected = config.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`
                p-3 rounded-xl border text-left transition-all relative
                ${isSelected
                  ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-white'
                  : 'border-white/10 bg-slate-900/60 hover:border-white/20 text-slate-300'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs tracking-wide">{preset.label}</span>
                {isSelected && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400">{preset.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Custom Audio Upload */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-purple-400" />
            Custom Audio (2s clip)
          </span>
          {config.presetId === 'custom' && config.customAudioName && (
            <span className="text-[11px] text-purple-300 truncate max-w-[150px]">
              Active: {config.customAudioName}
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex-1 py-2 px-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition
              ${config.presetId === 'custom'
                ? 'border-purple-400 bg-purple-500/10 text-purple-200'
                : 'border-white/20 bg-slate-900/40 text-slate-300 hover:border-white/30 hover:bg-slate-800/40'}
            `}
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload MP3 / WAV (≤2s)</span>
          </button>

          {config.presetId === 'custom' && (
            <button
              type="button"
              onClick={() => handleSelectPreset('esports-horn')}
              title="Reset to Preset"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {uploadError && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Volume slider */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Master Volume</span>
          <span className="font-mono text-cyan-400">{Math.round(config.volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={config.volume}
          onChange={(e) => onUpdateConfig({ ...config, volume: parseFloat(e.target.value) })}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
