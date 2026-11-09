import React from 'react';
import { X, Settings, Volume2, VolumeX, Smartphone, RotateCcw } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface SettingsModalProps {
  isMuted: boolean;
  onToggleMute: () => void;
  showTouchButtons: boolean;
  onToggleTouchButtons: () => void;
  onResetStats: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  onToggleMute,
  showTouchButtons,
  onToggleTouchButtons,
  onResetStats,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 animate-in fade-in duration-200 backdrop-blur-xs">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl flex flex-col text-white">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-game font-black text-yellow-300">SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 my-4">
          {/* Sound Audio Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="flex items-center justify-between p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              <span className="font-bold text-sm">Game Audio & BGM</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${
                isMuted ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isMuted ? 'MUTED' : 'ENABLED'}
            </span>
          </button>

          {/* Touch Buttons Overlay */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleTouchButtons();
            }}
            className="flex items-center justify-between p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sm">Touch Thumb Buttons</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${
                showTouchButtons ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showTouchButtons ? 'SHOWN' : 'SWIPE ONLY'}
            </span>
          </button>

          {/* Reset High Score */}
          <button
            onClick={() => {
              if (window.confirm('Reset all high scores and coin records?')) {
                sounds.playHit();
                onResetStats();
              }
            }}
            className="flex items-center justify-between p-3.5 bg-slate-950/90 border border-red-900/50 hover:border-red-500 text-red-400 rounded-2xl active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5" />
              <span className="font-bold text-sm">Reset Save Data</span>
            </div>
            <span className="text-xs text-red-400/80 font-bold">CLEAR</span>
          </button>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl mt-auto transition-colors cursor-pointer"
        >
          Save & Back
        </button>
      </div>
    </div>
  );
};
