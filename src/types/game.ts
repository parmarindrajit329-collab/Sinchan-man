export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type Lane = -1 | 0 | 1;

export type CharacterCategory = 'ALL' | 'JAPANESE' | 'INDIAN' | 'SUPERHERO' | 'CLASSIC' | 'MOVIE' | 'ANIMAL';

export type CharacterId =
  | 'shinchan'
  | 'doraemon'
  | 'nobita'
  | 'bheem'
  | 'motu'
  | 'patlu'
  | 'ben10'
  | 'vir'
  | 'tom'
  | 'jerry'
  | 'sonic'
  | 'spongebob'
  | 'minion'
  | 'lion'
  | 'tiger';

export interface CharacterSkin {
  id: string;
  name: string;
  price: number;
  unlockedByDefault?: boolean;
  colorSwatch: string;
  accentColor: number;
}

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  subtitle: string;
  category: 'JAPANESE' | 'INDIAN' | 'SUPERHERO' | 'CLASSIC' | 'MOVIE' | 'ANIMAL';
  price: number; // 0 for default unlocked
  primaryColor: string;
  badge: string;
  ability: string;
  speedBonus: number; // e.g. +10%
  coinBonus: number; // e.g. +15%
  collectibleName: string;
  collectibleEmoji: string;
  description: string;
  skins: CharacterSkin[];
}

export type ObstacleType = 
  | 'LOW_HURDLE'
  | 'GARDEN_BENCH'
  | 'HIGH_SIGN'
  | 'HANGING_LAUNDRY'
  | 'DELIVERY_VAN'
  | 'MOVING_TRAIN'
  | 'ACTION_BOX';

export interface Obstacle {
  id: number;
  type: ObstacleType;
  lane: Lane;
  z: number;
  width: number;
  height: number;
  requiresSlide: boolean;
  canJumpOver: boolean;
  isMoving?: boolean;
  speed?: number;
  meshGroup: any;
}

export type PowerUpType = 'MAGNET' | 'SHIELD' | 'MULTIPLIER';

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  lane: Lane;
  z: number;
  y: number;
  collected: boolean;
  mesh: any;
}

export interface Coin {
  id: number;
  lane: Lane;
  z: number;
  y: number;
  collected: boolean;
  mesh: any;
}

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;
  remaining: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type: 'COINS_RUN' | 'DISTANCE_RUN' | 'SLIDE_COUNT' | 'SCORE_RUN' | 'JUMP_COUNT';
}

export interface GameStats {
  score: number;
  coins: number;
  distance: number;
  highScore: number;
  maxDistance: number;
  totalCoins: number;
  selectedCharacter: CharacterId;
  selectedSkinId: string;
  wolfDistance: number;
  activePowerUps: ActivePowerUp[];
  hasShield: boolean;
}
