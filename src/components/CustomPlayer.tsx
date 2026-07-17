import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, Video as VideoIcon, ExternalLink } from 'lucide-react';
import { MediaItem } from '../types';

interface CustomPlayerProps {
  item: MediaItem | null;
  onClose?: () => void;
}

export default function CustomPlayer({ item, onClose }: CustomPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset player state when selected item changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [item]);

  if (!item) {
    return (
      <div className="bg-[#0e0e0e] border border-white/5 rounded-none p-8 flex flex-col items-center justify-center text-center h-[320px]">
        <div className="w-12 h-12 rounded-none bg-[#151515] border border-white/10 flex items-center justify-center text-stone-400 mb-4 animate-pulse-subtle">
          <Music className="w-5 h-5" />
        </div>
        <h3 className="text-white font-sans text-xs uppercase tracking-widest mb-2 font-medium">Select a melody or video</h3>
        <p className="text-xs text-stone-500 max-w-xs font-serif italic">
          Click any of your sister's songs or videos below to open the dedicated player.
        </p>
      </div>
    );
  }

  // Check if it's a YouTube link
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getInstagramEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const paths = parsed.pathname.split('/').filter(Boolean);
      if (parsed.hostname.includes('instagram.com') && (paths[0] === 'p' || paths[0] === 'reel') && paths[1]) {
        return `https://www.instagram.com/${paths[0]}/${paths[1]}/embed`;
      }
    } catch (err) {
      return null;
    }
    return null;
  };

  const ytId = getYouTubeId(item.url);
  const instaUrl = getInstagramEmbedUrl(item.url);

  // Audio Playback Controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Audio playback failed:', err));
    }
  };

  const restartPlay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0e0e0e] border border-white/10 rounded-none p-6 shadow-none relative overflow-hidden animate-fade-in" id="custom-media-player">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-none bg-white/5 border border-white/10 text-stone-300">
            {item.type === 'audio' ? <Music className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold font-sans">
            Playing • {item.type}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-white px-2.5 py-1 rounded-none bg-[#161616] border border-white/5 hover:border-white/10 transition"
          >
            Close
          </button>
        )}
      </div>

      {/* Media Rendering Area */}
      <div className="relative rounded-none bg-black border border-white/5 overflow-hidden flex items-center justify-center mb-4 aspect-video">
        {item.type === 'video' ? (
          ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
              id="yt-iframe"
            />
          ) : instaUrl ? (
            <iframe
              src={instaUrl}
              className="absolute inset-0 w-full h-full border-none"
              scrolling="no"
              allowTransparency={true}
              allow="encrypted-media"
              title={item.title}
            />
          ) : (
            <video
              src={item.url}
              controls
              autoPlay
              className="absolute inset-0 w-full h-full object-contain"
              id="html5-video-player"
            />
          )
        ) : (
          /* Audio visual stage */
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#080808] flex flex-col items-center justify-center p-6">
            {/* Audio tag */}
            <audio
              ref={audioRef}
              src={item.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Rotating Vinyl/Record Graphic */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 mb-4">
              <div 
                className={`absolute inset-0 rounded-full bg-[#0a0a0a] border-4 border-stone-800 shadow-2xl flex items-center justify-center ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                }`}
              >
                {/* Vinyl grooves */}
                <div className="absolute inset-2 rounded-full border border-stone-800/40" />
                <div className="absolute inset-6 rounded-full border border-stone-800/40" />
                <div className="absolute inset-10 rounded-full border border-stone-800/40" />
                {/* Label */}
                <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 p-1.5 bg-[#161616] border border-white/10 text-stone-300 rounded-none shadow-lg">
                <Music className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Moving equalizer bars if playing */}
            <div className="flex items-center gap-1 h-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-stone-400 rounded-none"
                  style={{
                    height: isPlaying ? '100%' : '15%',
                    animation: isPlaying ? `bounce 1.2s ease-in-out infinite alternate` : 'none',
                    animationDelay: `${i * 0.12}s`,
                    transformOrigin: 'bottom',
                  }}
                />
              ))}
            </div>
            <style>{`
              @keyframes bounce {
                0% { transform: scaleY(0.2); }
                100% { transform: scaleY(1); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="mb-4">
        <h3 className="text-white text-base font-display font-light tracking-wide truncate">{item.title}</h3>
        <p className="text-stone-400 text-xs mt-1 font-serif italic line-clamp-2 leading-relaxed">
          {item.description || 'No description available.'}
        </p>
        <span className="inline-block mt-2.5 text-[9px] uppercase tracking-wider bg-white/5 border border-white/5 text-stone-400 px-2 py-0.5 rounded-none">
          {item.date}
        </span>
      </div>

      {/* Audio Custom Controls panel */}
      {item.type === 'audio' && (
        <div className="bg-black/40 p-4 rounded-none border border-white/5">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-2 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressBarChange}
            className="w-full h-1 bg-stone-900 rounded-none appearance-none cursor-pointer accent-white mb-4"
          />

          {/* Buttons panel */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={restartPlay}
              className="p-2 text-stone-400 hover:text-white hover:bg-[#151515] rounded-none transition border border-transparent hover:border-white/5"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-white hover:bg-stone-200 text-black rounded-none transition shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            <div className="flex items-center gap-1 text-stone-500">
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase">Stereo</span>
            </div>
          </div>
        </div>
      )}

      {/* Link info helper if external */}
      {item.url.startsWith('http') && !ytId && !instaUrl && (
        <div className="mt-3 flex items-center justify-between text-[10px] text-stone-500 bg-white/[0.02] px-3 py-2 border border-white/5 rounded-none">
          <span className="truncate max-w-[200px]">Link: {item.url}</span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-white hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            Source <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}
