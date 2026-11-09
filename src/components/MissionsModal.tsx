import React from 'react';
import { X, Award, CheckCircle, Coins } from 'lucide-react';
import { Mission } from '../types/game';
import { sounds } from '../audio/SoundManager';

interface MissionsModalProps {
  missions: Mission[];
  onClaimReward: (missionId: string, reward: number) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onClaimReward,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 animate-in fade-in duration-200 backdrop-blur-xs">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh] text-white">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-game font-black text-yellow-300">DAILY MISSIONS</h2>
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

        <div className="flex flex-col gap-3 my-4 overflow-y-auto pr-1">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.current / m.target) * 100));

            return (
              <div
                key={m.id}
                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-yellow-100">{m.title}</h3>
                    <p className="text-xs text-slate-400">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-game font-black text-xs bg-amber-500/20 px-2 py-1 rounded-lg shrink-0">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{m.reward}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    {m.current} / {m.target}
                  </span>

                  {m.claimed ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : m.completed ? (
                    <button
                      onClick={() => {
                        sounds.playPowerup();
                        onClaimReward(m.id, m.reward);
                      }}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-game font-black rounded-xl shadow-sm active:scale-95 transition-transform cursor-pointer"
                    >
                      CLAIM REWARD
                    </button>
                  ) : (
                    <span className="text-slate-500 font-medium">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl mt-auto transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
