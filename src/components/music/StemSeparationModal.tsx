import React, { useState } from 'react';
import { Sliders, Volume2, VolumeX, Mic, Disc3, Music2, Play, Pause, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import type { AIMusicTrack } from '@/types/kamatela';
import { aiMusicSynth, type StemSettings } from '@/utils/aiMusicSynth';

interface StemSeparationModalProps {
  track: AIMusicTrack | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StemSeparationModal: React.FC<StemSeparationModalProps> = ({
  track,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stems, setStems] = useState<StemSettings>(() => aiMusicSynth.getStemSettings());
  const [exportingStem, setExportingStem] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      aiMusicSynth.stop();
      setIsPlaying(false);
    } else {
      aiMusicSynth.playTrack(track.id, track.genre, () => setIsPlaying(false), track);
      setIsPlaying(true);
      toast.info(`Mixing stems for "${track.title}"`);
    }
  };

  const handleVolumeChange = (stemKey: 'vocals' | 'beat' | 'bass', value: number[]) => {
    const newStems = {
      ...stems,
      [stemKey]: {
        ...stems[stemKey],
        volume: value[0],
      },
    };
    setStems(newStems);
    aiMusicSynth.updateStemSettings(newStems);
  };

  const handleToggleMute = (stemKey: 'vocals' | 'beat' | 'bass') => {
    const newStems = {
      ...stems,
      [stemKey]: {
        ...stems[stemKey],
        muted: !stems[stemKey].muted,
      },
    };
    setStems(newStems);
    aiMusicSynth.updateStemSettings(newStems);
  };

  const handleToggleSolo = (stemKey: 'vocals' | 'beat' | 'bass') => {
    const newStems = {
      ...stems,
      [stemKey]: {
        ...stems[stemKey],
        solo: !stems[stemKey].solo,
      },
    };
    setStems(newStems);
    aiMusicSynth.updateStemSettings(newStems);
    if (!stems[stemKey].solo) {
      toast.info(`Soloing ${stemKey} channel`);
    }
  };

  const handleExportIndividualStem = async (stemKey: 'vocals' | 'beat' | 'bass', stemName: string) => {
    try {
      setExportingStem(stemKey);
      toast.info(`Rendering isolated ${stemName} WAV...`);
      await aiMusicSynth.exportStemAsWav(track, stemKey);
      toast.success(`Downloaded isolated ${stemName} stem (.wav)!`);
    } catch {
      toast.error('Failed to export stem file');
    } finally {
      setExportingStem(null);
    }
  };

  const stemList = [
    {
      key: 'vocals' as const,
      name: 'Vocals & Lead Melody',
      icon: Mic,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border-purple-500/30',
      barColor: 'bg-purple-500',
    },
    {
      key: 'beat' as const,
      name: 'Beat & Drums Percussion',
      icon: Disc3,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30',
      barColor: 'bg-emerald-500',
    },
    {
      key: 'bass' as const,
      name: 'Bassline & Harmony Sub',
      icon: Music2,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
      barColor: 'bg-amber-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                  AI STEM SPLITTER
                </span>
                <span className="text-[10px] text-zinc-400">{track.genre}</span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-[220px]">
                {track.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              aiMusicSynth.stop();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/80"
          >
            ✕
          </button>
        </div>

        {/* Master Playback Controls */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <div>
              <p className="text-xs font-semibold text-white">Master Stem Output</p>
              <p className="text-[10px] text-zinc-400">
                {isPlaying ? 'Live Real-Time Audio Mixer' : 'Tap play to audition stems'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const reset: StemSettings = {
                vocals: { volume: 80, muted: false, solo: false },
                beat: { volume: 85, muted: false, solo: false },
                bass: { volume: 90, muted: false, solo: false },
              };
              setStems(reset);
              aiMusicSynth.updateStemSettings(reset);
              toast.success('Mixer reset to balanced defaults');
            }}
            className="text-[10px] text-zinc-400 hover:text-white h-7 px-2"
          >
            Reset Mix
          </Button>
        </div>

        {/* Individual Stems Faders & Isolated Downloads List */}
        <div className="space-y-3">
          {stemList.map((item) => {
            const stemState = stems[item.key];
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg ${item.bgColor} flex items-center justify-center ${item.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-white">{item.name}</span>
                  </div>

                  {/* Mute, Solo & Individual Stem Export */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleMute(item.key)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        stemState.muted
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white/10 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      MUTE
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSolo(item.key)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        stemState.solo
                          ? 'bg-amber-500 text-black border-amber-500 font-extrabold'
                          : 'bg-white/10 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      SOLO
                    </button>

                    {/* Download Isolated Stem WAV */}
                    <button
                      type="button"
                      disabled={exportingStem === item.key}
                      onClick={() => handleExportIndividualStem(item.key, item.name)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 hover:bg-white/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                      title={`Export isolated ${item.name} as WAV`}
                    >
                      <Download className="w-2.5 h-2.5" />
                      {exportingStem === item.key ? '...' : 'WAV'}
                    </button>
                  </div>
                </div>

                {/* Volume Slider & Animated Level Meter */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-400 w-8">
                    {stemState.muted ? '0%' : `${stemState.volume}%`}
                  </span>

                  <Slider
                    disabled={stemState.muted}
                    value={[stemState.volume]}
                    max={100}
                    step={1}
                    onValueChange={(val) => handleVolumeChange(item.key, val)}
                    className="flex-1"
                  />

                  {/* Live VU Peak Meter bars */}
                  <div className="flex items-end gap-0.5 h-4 w-6 bg-black/40 p-0.5 rounded">
                    {[1, 2, 3].map((b) => (
                      <div
                        key={b}
                        className={`flex-1 rounded-sm transition-all duration-75 ${
                          isPlaying && !stemState.muted ? item.barColor : 'bg-zinc-700'
                        }`}
                        style={{
                          height: isPlaying && !stemState.muted ? `${Math.random() * 80 + 20}%` : '20%',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <p className="text-[10px] text-zinc-400">
            Isolated stems render & download in high-res WAV
          </p>

          <Button
            size="sm"
            onClick={() => {
              toast.success('Stem settings saved for playback');
              onClose();
            }}
            className="h-8 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
          >
            Done Mixing
          </Button>
        </div>
      </div>
    </div>
  );
};
