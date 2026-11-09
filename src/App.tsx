import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './three/GameEngine';
import { GameState, GameStats, CharacterId, Mission } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { TouchControls } from './components/TouchControls';
import { CharacterGalleryModal } from './components/CharacterGalleryModal';
import { MissionsModal } from './components/MissionsModal';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { sounds } from './audio/SoundManager';

type ModalType = 'NONE' | 'GALLERY' | 'MISSIONS' | 'SHOP' | 'SETTINGS';

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Speed Dash',
    description: 'Sprint 400 meters in a single run',
    target: 400,
    current: 0,
    reward: 50,
    completed: false,
    claimed: false,
    type: 'DISTANCE_RUN',
  },
  {
    id: 'm2',
    title: 'Snack Feast',
    description: 'Collect 40 snack coins in one run',
    target: 40,
    current: 0,
    reward: 60,
    completed: false,
    claimed: false,
    type: 'COINS_RUN',
  },
  {
    id: 'm3',
    title: 'Smooth Slider',
    description: 'Slide under 5 overhead barriers',
    target: 5,
    current: 0,
    reward: 45,
    completed: false,
    claimed: false,
    type: 'SLIDE_COUNT',
  },
  {
    id: 'm4',
    title: 'High Hopper',
    description: 'Jump over 8 road hurdles and benches',
    target: 8,
    current: 0,
    reward: 45,
    completed: false,
    claimed: false,
    type: 'JUMP_COUNT',
  },
  {
    id: 'm5',
    title: 'High Scorer',
    description: 'Achieve a score of 2,500 points',
    target: 2500,
    current: 0,
    reward: 100,
    completed: false,
    claimed: false,
    type: 'SCORE_RUN',
  },
];

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');

  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    distance: 0,
    highScore: parseInt(localStorage.getItem('shinchan_high_score') || '0', 10),
    maxDistance: parseInt(localStorage.getItem('shinchan_max_dist') || '0', 10),
    totalCoins: parseInt(localStorage.getItem('shinchan_total_coins') || '0', 10),
    selectedCharacter: (localStorage.getItem('shinchan_selected_char') as CharacterId) || 'shinchan',
    wolfDistance: 5.0,
    activePowerUps: [],
    hasShield: false,
  });

  // Characters Unlocked (All 4 iconic cartoon heroes unlocked from start!)
  const [unlockedCharacters, setUnlockedCharacters] = useState<CharacterId[]>(() => {
    try {
      const saved = localStorage.getItem('shinchan_unlocked_chars');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all 4 main heroes are included
        const baseHeroes: CharacterId[] = ['shinchan', 'doraemon', 'bheem', 'vir'];
        return Array.from(new Set([...baseHeroes, ...parsed]));
      }
    } catch (e) {}
    return ['shinchan', 'doraemon', 'bheem', 'vir'];
  });

  // Missions
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('shinchan_missions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MISSIONS;
  });

  // Power-Up Upgrade Levels
  const [magnetLevel, setMagnetLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('shinchan_lvl_magnet') || '1', 10);
  });
  const [shieldLevel, setShieldLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('shinchan_lvl_shield') || '1', 10);
  });
  const [multLevel, setMultLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('shinchan_lvl_mult') || '1', 10);
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [showTouchButtons, setShowTouchButtons] = useState<boolean>(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // Action events from engine for mission progress
  const handleEngineAction = useCallback(
    (action: 'SLIDE' | 'JUMP' | 'COIN' | 'DISTANCE', amount: number = 1) => {
      setMissions((prevMissions) => {
        let changed = false;
        const updated = prevMissions.map((m) => {
          if (m.completed) return m;

          let newCur = m.current;
          if (action === 'SLIDE' && m.type === 'SLIDE_COUNT') newCur += amount;
          if (action === 'JUMP' && m.type === 'JUMP_COUNT') newCur += amount;
          if (action === 'COIN' && m.type === 'COINS_RUN') newCur += amount;
          if (action === 'DISTANCE' && m.type === 'DISTANCE_RUN') newCur += amount;

          if (newCur !== m.current) {
            changed = true;
            const completed = newCur >= m.target;
            return { ...m, current: newCur, completed };
          }
          return m;
        });

        if (changed) {
          localStorage.setItem('shinchan_missions', JSON.stringify(updated));
        }
        return changed ? updated : prevMissions;
      });
    },
    []
  );

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setGameState('GAMEOVER');
  }, []);

  // Initialize Three.js engine
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      handleStatsUpdate,
      handleGameOver,
      handleEngineAction
    );
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleStatsUpdate, handleGameOver, handleEngineAction]);

  // Actions
  const startGame = useCallback(() => {
    setActiveModal('NONE');
    if (engineRef.current) {
      engineRef.current.startGame();
      setGameState('PLAYING');
    }
  }, []);

  const pauseGame = useCallback(() => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.pauseGame();
      setGameState('PAUSED');
    }
  }, [gameState]);

  const resumeGame = useCallback(() => {
    if (engineRef.current && gameState === 'PAUSED') {
      engineRef.current.resumeGame();
      setGameState('PLAYING');
    }
  }, [gameState]);

  const restartGame = useCallback(() => {
    setActiveModal('NONE');
    if (engineRef.current) {
      engineRef.current.startGame();
      setGameState('PLAYING');
    }
  }, []);

  const returnToTitle = useCallback(() => {
    setActiveModal('NONE');
    if (engineRef.current) {
      engineRef.current.setupTitleMode();
      setGameState('TITLE');
    }
  }, []);

  const toggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Character selection & unlocking
  const handleSelectCharacter = useCallback((charId: CharacterId) => {
    if (engineRef.current) {
      engineRef.current.selectCharacter(charId);
      setStats((prev) => ({ ...prev, selectedCharacter: charId }));
    }
  }, []);

  const handleUnlockCharacter = useCallback(
    (charId: CharacterId, cost: number) => {
      if (stats.totalCoins >= cost) {
        const newCoins = stats.totalCoins - cost;
        const newUnlocked = [...unlockedCharacters, charId];
        setUnlockedCharacters(newUnlocked);
        localStorage.setItem('shinchan_unlocked_chars', JSON.stringify(newUnlocked));
        localStorage.setItem('shinchan_total_coins', String(newCoins));

        setStats((prev) => ({ ...prev, totalCoins: newCoins }));
        handleSelectCharacter(charId);
      }
    },
    [stats.totalCoins, unlockedCharacters, handleSelectCharacter]
  );

  // Claim Mission Reward
  const handleClaimReward = useCallback(
    (missionId: string, reward: number) => {
      setMissions((prev) => {
        const next = prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m));
        localStorage.setItem('shinchan_missions', JSON.stringify(next));
        return next;
      });

      const newCoins = stats.totalCoins + reward;
      localStorage.setItem('shinchan_total_coins', String(newCoins));
      setStats((prev) => ({ ...prev, totalCoins: newCoins }));
    },
    [stats.totalCoins]
  );

  // Shop Upgrades
  const handleUpgrade = useCallback(
    (type: 'MAGNET' | 'SHIELD' | 'MULT', cost: number) => {
      if (stats.totalCoins >= cost) {
        const newCoins = stats.totalCoins - cost;
        localStorage.setItem('shinchan_total_coins', String(newCoins));
        setStats((prev) => ({ ...prev, totalCoins: newCoins }));

        if (type === 'MAGNET') {
          const next = magnetLevel + 1;
          setMagnetLevel(next);
          localStorage.setItem('shinchan_lvl_magnet', String(next));
        } else if (type === 'SHIELD') {
          const next = shieldLevel + 1;
          setShieldLevel(next);
          localStorage.setItem('shinchan_lvl_shield', String(next));
        } else {
          const next = multLevel + 1;
          setMultLevel(next);
          localStorage.setItem('shinchan_lvl_mult', String(next));
        }
      }
    },
    [stats.totalCoins, magnetLevel, shieldLevel, multLevel]
  );

  // Reset Stats
  const handleResetStats = useCallback(() => {
    localStorage.clear();
    setStats({
      score: 0,
      coins: 0,
      distance: 0,
      highScore: 0,
      maxDistance: 0,
      totalCoins: 0,
      selectedCharacter: 'shinchan',
      wolfDistance: 5.0,
      activePowerUps: [],
      hasShield: false,
    });
    setUnlockedCharacters(['shinchan', 'doraemon', 'bheem', 'vir']);
    setMissions(INITIAL_MISSIONS);
    setMagnetLevel(1);
    setShieldLevel(1);
    setMultLevel(1);
    handleSelectCharacter('shinchan');
    returnToTitle();
  }, [handleSelectCharacter, returnToTitle]);

  // Touch & Key Dispatchers
  const moveLeft = useCallback(() => engineRef.current?.moveLeft(), []);
  const moveRight = useCallback(() => engineRef.current?.moveRight(), []);
  const jump = useCallback(() => engineRef.current?.jump(), []);
  const slide = useCallback(() => engineRef.current?.slide(), []);

  // Global Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (activeModal !== 'NONE') {
        if (e.key === 'Escape') setActiveModal('NONE');
        return;
      }

      if (gameState === 'TITLE') {
        if (e.key === ' ' || e.key === 'Enter') startGame();
        return;
      }

      if (gameState === 'GAMEOVER') {
        if (e.key === ' ' || e.key === 'Enter') restartGame();
        return;
      }

      if (gameState === 'PAUSED') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') resumeGame();
        return;
      }

      if (gameState === 'PLAYING') {
        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            moveLeft();
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            moveRight();
            break;
          case 'ArrowUp':
          case 'w':
          case 'W':
          case ' ':
            jump();
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            slide();
            break;
          case 'Escape':
          case 'p':
          case 'P':
            pauseGame();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeModal, startGame, restartGame, resumeGame, pauseGame, moveLeft, moveRight, jump, slide]);

  const unclaimedMissionsCount = missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 1. WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* 2. Title Screen Overlay */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={startGame}
          onOpenGallery={() => setActiveModal('GALLERY')}
          onOpenMissions={() => setActiveModal('MISSIONS')}
          onOpenShop={() => setActiveModal('SHOP')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
          selectedCharacter={stats.selectedCharacter}
          highScore={stats.highScore}
          maxDistance={stats.maxDistance}
          totalCoins={stats.totalCoins}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          unclaimedMissionsCount={unclaimedMissionsCount}
        />
      )}

      {/* 3. In-Game HUD Overlay */}
      {gameState === 'PLAYING' && (
        <>
          <GameHUD
            stats={stats}
            onPause={pauseGame}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            showTouchButtons={showTouchButtons}
            onToggleTouchButtons={() => setShowTouchButtons((prev) => !prev)}
          />
          <TouchControls
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onJump={jump}
            onSlide={slide}
            showButtons={showTouchButtons}
          />
        </>
      )}

      {/* 4. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={resumeGame}
          onRestart={restartGame}
          onHome={returnToTitle}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* 5. Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={restartGame}
          onHome={returnToTitle}
          onOpenGallery={() => {
            returnToTitle();
            setActiveModal('GALLERY');
          }}
        />
      )}

      {/* 6. Modals for Character Gallery, Missions, Shop & Settings */}
      {activeModal === 'GALLERY' && (
        <CharacterGalleryModal
          selectedCharacter={stats.selectedCharacter}
          unlockedCharacters={unlockedCharacters}
          totalCoins={stats.totalCoins}
          onSelectCharacter={handleSelectCharacter}
          onUnlockCharacter={handleUnlockCharacter}
          onClose={() => setActiveModal('NONE')}
          onStartRun={startGame}
        />
      )}

      {activeModal === 'MISSIONS' && (
        <MissionsModal
          missions={missions}
          onClaimReward={handleClaimReward}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'SHOP' && (
        <ShopModal
          totalCoins={stats.totalCoins}
          magnetLevel={magnetLevel}
          shieldLevel={shieldLevel}
          multLevel={multLevel}
          onUpgrade={handleUpgrade}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {activeModal === 'SETTINGS' && (
        <SettingsModal
          isMuted={isMuted}
          onToggleMute={toggleMute}
          showTouchButtons={showTouchButtons}
          onToggleTouchButtons={() => setShowTouchButtons((prev) => !prev)}
          onResetStats={handleResetStats}
          onClose={() => setActiveModal('NONE')}
        />
      )}
    </div>
  );
}
