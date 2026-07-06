'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Music2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { usePublicWedding } from '@/hooks/usePublicWedding';

interface MusicConfig {
  url?: string;
  title?: string;
  artist?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export default function MusicPlayer() {
  const { data } = usePublicWedding();
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Read config from wedding data
  const musicEnabled = data?.featureFlags?.['music'] ?? false;
  const config: MusicConfig = (data?.featureConfigs?.['music'] as MusicConfig) ?? {};

  // Initialize audio element
  useEffect(() => {
    if (musicEnabled && config.url) {
      const audio = new Audio(config.url);
      audio.loop = config.loop !== false;
      audio.preload = 'metadata';
      audio.volume = 0.7;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
        }
      });

      audio.addEventListener('ended', () => {
        if (!audio.loop) {
          setPlaying(false);
        }
      });

      audioRef.current = audio;

      // Attempt autoplay
      if (config.autoplay !== false) {
        audio.play().then(() => {
          setPlaying(true);
        }).catch(() => {
          // Browser blocked autoplay
          setAutoplayBlocked(true);
        });
      }

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, [musicEnabled, config.url, config.loop, config.autoplay]);

  // Update volume when muted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : 0.7;
    }
  }, [muted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
        setAutoplayBlocked(false);
      }).catch(() => {
        // ignore
      });
    }
  }, [playing]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  // Progress bar animation frame
  useEffect(() => {
    const update = () => {
      if (audioRef.current && playing) {
        if (audioRef.current.duration) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration);
        }
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playing]);

  // Close on click outside
  useEffect(() => {
    if (!expanded) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded]);

  if (!musicEnabled || !config.url) return null;

  const displayTitle = config.title || 'Background Music';
  const displayArtist = config.artist || '';

  const progressPercent = duration > 0 ? (progress * 100) : 0;

  return (
    <div
      ref={containerRef}
      className="fixed z-40 bottom-[calc(env(safe-area-inset-bottom)+72px)] right-4 md:bottom-6 md:right-6 flex items-end gap-2"
    >
      {/* Expanded mini player */}
      <div
        className={`flex items-center gap-3 bg-white/95 backdrop-blur-md border border-champagne-silk/60 rounded-2xl shadow-lg px-4 py-3 transition-all duration-300 origin-bottom-right ${
          expanded
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-90 translate-x-4 pointer-events-none'
        }`}
        style={{ minWidth: '220px' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-charcoal-ink truncate">{displayTitle}</p>
          {displayArtist && (
            <p className="text-[10px] text-charcoal-ink/50 truncate">{displayArtist}</p>
          )}
          {/* Progress bar */}
          <div className="mt-1.5 h-[2px] bg-charcoal-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cinematic-gold rounded-full transition-[width] duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={togglePlay}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-charcoal-ink/5 transition-colors"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause className="size-3.5 text-charcoal-ink" />
            ) : (
              <Play className="size-3.5 text-charcoal-ink" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-charcoal-ink/5 transition-colors"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <VolumeX className="size-3.5 text-charcoal-ink/40" />
            ) : (
              <Volume2 className="size-3.5 text-charcoal-ink" />
            )}
          </button>
        </div>
      </div>

      {/* Main floating button */}
      <button
        onClick={() => {
          if (autoplayBlocked) {
            // First click: start playing
            togglePlay();
            return;
          }
          setExpanded((prev) => !prev);
        }}
        className="h-10 w-10 rounded-full bg-white/95 backdrop-blur-md border border-champagne-silk/60 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label={autoplayBlocked ? 'Click to play music' : expanded ? 'Collapse music player' : 'Open music player'}
      >
        {autoplayBlocked ? (
          <Play className="size-4 text-cinematic-gold" />
        ) : (
          <Music2
            className={`size-4 text-cinematic-gold ${playing ? 'animate-pulse' : ''}`}
          />
        )}
      </button>

      {/* Autoplay blocked tooltip */}
      {autoplayBlocked && (
        <div className="absolute -top-8 right-0 bg-charcoal-ink text-paper-cream text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
          Click to play
        </div>
      )}
    </div>
  );
}