import React, { useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  showButtons: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  showButtons,
}) => {
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number>(0);

  // Full-screen touch swipe listener
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept if touching an interactive button
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      if (e.touches.length > 0) {
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        touchStartTime.current = performance.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartPos.current || e.changedTouches.length === 0) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - touchStartPos.current.x;
      const dy = endY - touchStartPos.current.y;
      const duration = performance.now() - touchStartTime.current;

      touchStartPos.current = null;

      // Swipe criteria
      const threshold = 28; // minimum pixels
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (duration < 600 && (absDx > threshold || absDy > threshold)) {
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0) {
            onMoveRight();
          } else {
            onMoveLeft();
          }
        } else {
          // Vertical swipe
          if (dy < 0) {
            onJump();
          } else {
            onSlide();
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onMoveLeft, onMoveRight, onJump, onSlide]);

  if (!showButtons) return null;

  return (
    <div className="absolute inset-x-0 bottom-3 sm:bottom-6 z-25 pointer-events-none px-4 flex justify-between items-end">
      {/* Left thumb group: Move Left / Move Right */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sounds.playClick();
            onMoveLeft();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-yellow-400 text-white active:text-slate-950 border-2 border-yellow-400/80 shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-8 h-8 stroke-[3]" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onMoveRight();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-yellow-400 text-white active:text-slate-950 border-2 border-yellow-400/80 shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          aria-label="Move Right"
        >
          <ArrowRight className="w-8 h-8 stroke-[3]" />
        </button>
      </div>

      {/* Right thumb group: Slide & Jump */}
      <div className="flex gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sounds.playClick();
            onSlide();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-900/80 active:bg-sky-400 text-white active:text-slate-950 border-2 border-sky-400/80 shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer"
          aria-label="Slide"
        >
          <ArrowDown className="w-7 h-7 stroke-[3]" />
          <span className="text-[9px] font-black uppercase tracking-tight">Slide</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onJump();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/90 active:bg-yellow-300 text-white active:text-slate-950 border-2 border-yellow-300 shadow-lg flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer"
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span className="text-[9px] font-black uppercase tracking-tight">Jump</span>
        </button>
      </div>
    </div>
  );
};
