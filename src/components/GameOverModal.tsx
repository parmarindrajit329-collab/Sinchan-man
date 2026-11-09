import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Sparkles, Footprints, Users } from 'lucide-react';
import { GameStats } from '../types/game';
import { CHARACTERS } from '../three/characters/CharacterRegistry';
import { sounds } from '../audio/SoundManager';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
  onOpenGallery: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome,
  onOpenGallery,
}) => {
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;
  const activeChar = CHARACTERS[stats.selectedCharacter];

  useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#facc15', '#ef4444', '#38bdf8', '#4ade80'],
        });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [isNewHighScore]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
        {/* Cartoon Header */}
        <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-400 flex items-center justify-center text-3xl mb-2 animate-bounce">
          🐺
        </div>

        <h2 className="text-3xl sm:text-4xl font-game font-black text-rose-500 drop-shadow-[0_3px_0_#881337] mb-1">
          WOLF CAUGHT YOU!
        </h2>
        <p className="text-xs text-slate-300 font-semibold mb-4">
          {isNewHighScore ? '🎉 Incredible! A brand new High Score!' : 'The hungry wolf pounced! Try again!'}
        </p>

        {/* Stats Grid */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          {/* Final Score */}
          <div className="flex flex-col items-center pb-2.5 border-b border-slate-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-yellow-400/90">
              Final Score
            </span>
            <span className="text-3xl sm:text-4xl font-game font-black text-yellow-300 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Sub Stats Row */}
          <div className="grid grid-cols-2 gap-2 text-left pt-1">
            {/* Distance */}
            <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <Footprints className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Distance</div>
                <div className="text-sm font-black text-sky-300 tabular-nums">{stats.distance} m</div>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-base shrink-0">{activeChar.collectibleEmoji}</span>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Coins</div>
                <div className="text-sm font-black text-yellow-400 tabular-nums">+{stats.coins}</div>
              </div>
            </div>
          </div>

          {/* High Score Banner */}
          <div className="flex items-center justify-between px-3 py-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Personal Best</span>
            </div>
            <span className="font-game text-yellow-300 font-black tabular-nums">
              {stats.highScore.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {/* Play Again */}
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-3.5 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 font-game font-black text-lg rounded-2xl border-2 border-white shadow-[0_4px_0_#b45309] active:shadow-[0_1px_0_#b45309] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[3]" />
            <span>PLAY AGAIN</span>
          </button>

          {/* Switch Character */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenGallery();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-game font-bold text-sm rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Users className="w-4 h-4" />
            <span>Switch Hero ({activeChar.name})</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="w-full py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 inline mr-1" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
