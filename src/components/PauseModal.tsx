import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/70">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
        {/* Pause Banner */}
        <h2 className="text-3xl sm:text-4xl font-game font-black text-yellow-300 drop-shadow-[0_3px_0_#b45309] mb-1">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-300 font-medium mb-6">Take a quick breather, Shinchan!</p>

        {/* Buttons List */}
        <div className="flex flex-col gap-3 w-full">
          {/* Resume */}
          <button
            onClick={() => {
              sounds.playClick();
              onResume();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-game font-black text-lg rounded-2xl border-2 border-green-300 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-game font-black text-base rounded-2xl border-2 border-yellow-200 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>RESTART RUN</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-600 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          {/* Return to Title */}
          <button
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm rounded-2xl border border-slate-700 shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
