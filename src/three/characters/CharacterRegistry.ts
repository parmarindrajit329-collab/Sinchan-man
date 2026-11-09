import { CharacterId, CharacterConfig } from '../../types/game';
import { ICharacterModel } from './CharacterTypes';
import { ShinchanModel } from '../ShinchanModel';
import { DoraemonModel } from './DoraemonModel';
import { NobitaModel } from './NobitaModel';
import { SonicModel } from './SonicModel';
import { ChhotaBheemModel } from './ChhotaBheemModel';
import { MotuModel } from './MotuModel';
import { PatluModel } from './PatluModel';
import { Ben10Model } from './Ben10Model';
import { VirRobotBoyModel } from './VirRobotBoyModel';
import { TomModel } from './TomModel';
import { JerryModel } from './JerryModel';
import { SpongeBobModel } from './SpongeBobModel';
import { MinionModel } from './MinionModel';
import { LionModel } from './LionModel';
import { TigerModel } from './TigerModel';

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  // --- JAPANESE CARTOONS ---
  shinchan: {
    id: 'shinchan',
    name: 'Shinchan',
    subtitle: 'Kasukabe Mischief Star',
    category: 'JAPANESE',
    price: 0, // Unlocked by default
    primaryColor: '#ef4444',
    badge: 'Mischief King',
    ability: 'Agile Belly Slide & Funny Wiggle Recovery',
    speedBonus: 0,
    coinBonus: 0,
    collectibleName: 'Chocobi',
    collectibleEmoji: '⭐',
    description: 'Energetic and cheeky, running with hilarious moves and Action Kamen superhero spirit!',
    skins: [
      { id: 'shinchan_classic', name: 'Classic Red & Yellow', price: 0, unlockedByDefault: true, colorSwatch: '#ef4444', accentColor: 0xef233c },
      { id: 'shinchan_kamen', name: 'Action Kamen Suit', price: 200, colorSwatch: '#0284c7', accentColor: 0x0284c7 },
      { id: 'shinchan_gold', name: 'Golden Legend', price: 500, colorSwatch: '#f59e0b', accentColor: 0xf59e0b },
    ],
  },
  doraemon: {
    id: 'doraemon',
    name: 'Doraemon',
    subtitle: '22nd Century Cat Robot',
    category: 'JAPANESE',
    price: 200,
    primaryColor: '#0284c7',
    badge: 'Take-Copter Gadget',
    ability: 'Bamboo Copter High Flight & Extra Magnet Pull',
    speedBonus: 5,
    coinBonus: 10,
    collectibleName: 'Dorayaki',
    collectibleEmoji: '🥞',
    description: 'Equipped with his 4D pocket, magical golden bell, and spinning Bamboo Copter flight!',
    skins: [
      { id: 'doraemon_classic', name: 'Robo Sky Blue', price: 0, unlockedByDefault: true, colorSwatch: '#0284c7', accentColor: 0x0284c7 },
      { id: 'doraemon_yellow', name: 'Original 2112 Yellow', price: 250, colorSwatch: '#facc15', accentColor: 0xfacc15 },
      { id: 'doraemon_gold', name: 'Cyber 22nd Gold', price: 600, colorSwatch: '#f59e0b', accentColor: 0xf59e0b },
    ],
  },
  nobita: {
    id: 'nobita',
    name: 'Nobita',
    subtitle: 'Clumsy Dreamer with Heart',
    category: 'JAPANESE',
    price: 250,
    primaryColor: '#eab308',
    badge: 'Lucky Escape',
    ability: 'Lucky Stumble Dodge & Slowed Wolf Pursuit',
    speedBonus: 4,
    coinBonus: 12,
    collectibleName: 'Comic Book',
    collectibleEmoji: '📖',
    description: 'Never gives up! Runs in his yellow polo and round spectacles with pure determination!',
    skins: [
      { id: 'nobita_classic', name: 'Yellow Polo & Navy', price: 0, unlockedByDefault: true, colorSwatch: '#eab308', accentColor: 0xeab308 },
      { id: 'nobita_blue', name: 'School Uniform Blue', price: 200, colorSwatch: '#3b82f6', accentColor: 0x3b82f6 },
      { id: 'nobita_pyjamas', name: 'Sleepyhead Pyjamas', price: 350, colorSwatch: '#ec4899', accentColor: 0xec4899 },
    ],
  },
  sonic: {
    id: 'sonic',
    name: 'Sonic the Hedgehog',
    subtitle: 'Blue Blur Supersonic Runner',
    category: 'JAPANESE',
    price: 900,
    primaryColor: '#2563eb',
    badge: 'Supersonic Dash',
    ability: 'Spin Dash Roll & +25% Base Sprint Velocity',
    speedBonus: 25,
    coinBonus: 35,
    collectibleName: 'Power Ring',
    collectibleEmoji: '💍',
    description: 'The fastest hedgehog alive! Supersonic speed, rolling slide dash, and quills flying in the wind!',
    skins: [
      { id: 'sonic_classic', name: 'Cobalt Speedster', price: 0, unlockedByDefault: true, colorSwatch: '#2563eb', accentColor: 0x2563eb },
      { id: 'sonic_super', name: 'Super Sonic Golden Form', price: 800, colorSwatch: '#facc15', accentColor: 0xfacc15 },
    ],
  },

  // --- INDIAN CARTOONS ---
  bheem: {
    id: 'bheem',
    name: 'Chhota Bheem',
    subtitle: 'Mighty Hero of Dholakpur',
    category: 'INDIAN',
    price: 300,
    primaryColor: '#ea580c',
    badge: 'Laddoo Power',
    ability: 'Fearless Heroic Stride & +15% Laddoo Coin Value',
    speedBonus: 8,
    coinBonus: 15,
    collectibleName: 'Laddoo',
    collectibleEmoji: '🟡',
    description: 'Boundless courage, sacred tilak, and heroic runner stamina powered by golden Motichoor laddoos!',
    skins: [
      { id: 'bheem_classic', name: 'Saffron Silk Dhoti', price: 0, unlockedByDefault: true, colorSwatch: '#ea580c', accentColor: 0xea580c },
      { id: 'bheem_royal', name: 'Royal Dholakpur Gold', price: 350, colorSwatch: '#facc15', accentColor: 0xfacc15 },
      { id: 'bheem_warrior', name: 'Crimson Battle Dhoti', price: 500, colorSwatch: '#dc2626', accentColor: 0xdc2626 },
    ],
  },
  motu: {
    id: 'motu',
    name: 'Motu',
    subtitle: 'Furiousb Belly Runner',
    category: 'INDIAN',
    price: 400,
    primaryColor: '#dc2626',
    badge: 'Samosa Rush',
    ability: 'Samosa Turbo Boost & Smashing Obstacle Ram',
    speedBonus: 10,
    coinBonus: 20,
    collectibleName: 'Samosa',
    collectibleEmoji: '🥟',
    description: 'Whenever he smells hot piping samosas, his round belly propels him at runaway freight train speeds!',
    skins: [
      { id: 'motu_classic', name: 'Red Vest & Dhoti', price: 0, unlockedByDefault: true, colorSwatch: '#dc2626', accentColor: 0xdc2626 },
      { id: 'motu_chef', name: 'Master Chef Furpat', price: 300, colorSwatch: '#f97316', accentColor: 0xf97316 },
      { id: 'motu_gold', name: 'Golden Samosa King', price: 600, colorSwatch: '#eab308', accentColor: 0xeab308 },
    ],
  },
  patlu: {
    id: 'patlu',
    name: 'Patlu',
    subtitle: 'Brilliant Furfuri Strategist',
    category: 'INDIAN',
    price: 450,
    primaryColor: '#ca8a04',
    badge: 'Idea Bulb',
    ability: 'Idea Bulb Shield & Magnet Attraction Radius x2',
    speedBonus: 9,
    coinBonus: 22,
    collectibleName: 'Light Bulb',
    collectibleEmoji: '💡',
    description: 'Slender intellect! "Idea!" lights up over his head to automatically attract all floating coins!',
    skins: [
      { id: 'patlu_classic', name: 'Yellow Kurta & Spectacles', price: 0, unlockedByDefault: true, colorSwatch: '#ca8a04', accentColor: 0xca8a04 },
      { id: 'patlu_professor', name: 'Professor Emerald Kurta', price: 300, colorSwatch: '#10b981', accentColor: 0x10b981 },
      { id: 'patlu_super', name: 'Super Brain Royal Violet', price: 550, colorSwatch: '#8b5cf6', accentColor: 0x8b5cf6 },
    ],
  },

  // --- SUPERHERO CARTOONS ---
  ben10: {
    id: 'ben10',
    name: 'Ben 10',
    subtitle: 'Alien Omnitrix Defender',
    category: 'SUPERHERO',
    price: 600,
    primaryColor: '#16a34a',
    badge: 'Omnitrix Hero',
    ability: 'Omnitrix Alien Surge & Invulnerable Hurdle Stride',
    speedBonus: 14,
    coinBonus: 24,
    collectibleName: 'Alien DNA',
    collectibleEmoji: '🧪',
    description: 'Wielding the glowing green Omnitrix watch on his left wrist, Ben sprints ahead to save the day!',
    skins: [
      { id: 'ben10_classic', name: 'Original Striped Tee', price: 0, unlockedByDefault: true, colorSwatch: '#16a34a', accentColor: 0x16a34a },
      { id: 'ben10_alien_force', name: 'Alien Force Green Jacket', price: 400, colorSwatch: '#15803d', accentColor: 0x15803d },
      { id: 'ben10_omnitrix_glow', name: 'Omniverse Energy Glow', price: 700, colorSwatch: '#22c55e', accentColor: 0x22c55e },
    ],
  },
  vir: {
    id: 'vir',
    name: 'Vir the Robot Boy',
    subtitle: 'Suited Robotic Superboy',
    category: 'SUPERHERO',
    price: 500,
    primaryColor: '#eab308',
    badge: 'Jetpack Cyber',
    ability: 'Dual Jetpack Thruster Boost & Cyber Agility',
    speedBonus: 12,
    coinBonus: 20,
    collectibleName: 'Power Orb',
    collectibleEmoji: '⚡',
    description: 'Supersonic jetpack dash, digital cyan visor, and futuristic robot agility!',
    skins: [
      { id: 'vir_classic', name: 'Red & Yellow Battle Suit', price: 0, unlockedByDefault: true, colorSwatch: '#dc2626', accentColor: 0xdc2626 },
      { id: 'vir_stealth', name: 'Stealth Titanium Armor', price: 400, colorSwatch: '#334155', accentColor: 0x334155 },
      { id: 'vir_gold', name: 'Solar Energy Gold', price: 650, colorSwatch: '#f59e0b', accentColor: 0xf59e0b },
    ],
  },

  // --- CLASSIC CARTOONS ---
  tom: {
    id: 'tom',
    name: 'Tom the Cat',
    subtitle: 'Tenacious Hunter',
    category: 'CLASSIC',
    price: 300,
    primaryColor: '#64748b',
    badge: 'Cat Reflexes',
    ability: 'Acrobatic Nine-Lives Bounce & Agile Paws',
    speedBonus: 7,
    coinBonus: 14,
    collectibleName: 'Fish Bone',
    collectibleEmoji: '🐟',
    description: 'Sleek blue-grey fur, white paws, and twitching ears ready to outrun any predator in town!',
    skins: [
      { id: 'tom_classic', name: 'Blue-Grey Fur & White Paws', price: 0, unlockedByDefault: true, colorSwatch: '#64748b', accentColor: 0x64748b },
      { id: 'tom_tuxedo', name: 'Midnight Tuxedo Black', price: 280, colorSwatch: '#1e293b', accentColor: 0x1e293b },
      { id: 'tom_pirate', name: 'Buccaneer Striped Fur', price: 450, colorSwatch: '#b91c1c', accentColor: 0xb91c1c },
    ],
  },
  jerry: {
    id: 'jerry',
    name: 'Jerry the Mouse',
    subtitle: 'Nimble Escape Artist',
    category: 'CLASSIC',
    price: 300,
    primaryColor: '#b45309',
    badge: 'Cheese Scamper',
    ability: 'Micro-Hitbox Squeeze & Rapid Scamper',
    speedBonus: 11,
    coinBonus: 18,
    collectibleName: 'Swiss Cheese',
    collectibleEmoji: '🧀',
    description: 'Tiny size allows him to slip through narrow gaps and slide under barriers with ease!',
    skins: [
      { id: 'jerry_classic', name: 'Warm Brown & Pink Ears', price: 0, unlockedByDefault: true, colorSwatch: '#b45309', accentColor: 0xb45309 },
      { id: 'jerry_cheese_king', name: 'Cheese King Golden Crown', price: 320, colorSwatch: '#f59e0b', accentColor: 0xf59e0b },
      { id: 'jerry_detective', name: 'Detective Fedora Fur', price: 480, colorSwatch: '#78350f', accentColor: 0x78350f },
    ],
  },
  spongebob: {
    id: 'spongebob',
    name: 'SpongeBob',
    subtitle: 'Optimistic Sea Sponge',
    category: 'CLASSIC',
    price: 550,
    primaryColor: '#eab308',
    badge: 'Bubble Hydroplane',
    ability: 'Hydroplane Belly Slide & Double Jump Altitude',
    speedBonus: 10,
    coinBonus: 22,
    collectibleName: 'Krabby Patty',
    collectibleEmoji: '🍔',
    description: 'Square yellow porous body, buck teeth, red necktie, and high-kicking cheerful strides!',
    skins: [
      { id: 'spongebob_classic', name: 'Classic Brown Trousers', price: 0, unlockedByDefault: true, colorSwatch: '#eab308', accentColor: 0xfacc15 },
      { id: 'spongebob_krusty', name: 'Krusty Krab Chef Hat', price: 350, colorSwatch: '#0284c7', accentColor: 0x0284c7 },
      { id: 'spongebob_gold', name: 'Golden Pineapple Sponge', price: 650, colorSwatch: '#f59e0b', accentColor: 0xf59e0b },
    ],
  },

  // --- ANIMATED MOVIES ---
  minion: {
    id: 'minion',
    name: 'Minion',
    subtitle: 'Yellow Mischief Henchman',
    category: 'MOVIE',
    price: 500,
    primaryColor: '#facc15',
    badge: 'Banana Mania',
    ability: 'Banana Frenzy Speed Burst & Comical Torpedo Slide',
    speedBonus: 12,
    coinBonus: 20,
    collectibleName: 'Banana',
    collectibleEmoji: '🍌',
    description: 'Yellow pill capsule body, dual silver goggles, and denim overalls running with hilarious waddle!',
    skins: [
      { id: 'minion_classic', name: 'Yellow & Denim Overalls', price: 0, unlockedByDefault: true, colorSwatch: '#facc15', accentColor: 0xfacc15 },
      { id: 'minion_purple', name: 'Evil Purple Minion', price: 400, colorSwatch: '#9333ea', accentColor: 0x9333ea },
      { id: 'minion_gold', name: 'Golden Anniversary', price: 650, colorSwatch: '#f59e0b', accentColor: 0xf59e0b },
    ],
  },

  // --- ANIMAL CHARACTERS ---
  lion: {
    id: 'lion',
    name: 'King Lion',
    subtitle: 'Wild Jungle Monarch',
    category: 'ANIMAL',
    price: 750,
    primaryColor: '#d97706',
    badge: 'Beast King',
    ability: 'Fierce Roar Leap & 2x Score Multiplier Duration',
    speedBonus: 16,
    coinBonus: 28,
    collectibleName: 'Gold Trophy',
    collectibleEmoji: '🏆',
    description: 'Majestic golden-maned predator with terrifying sprint power and boundless feline gallop!',
    skins: [
      { id: 'lion_classic', name: 'Tawny Golden Fur & Brown Mane', price: 0, unlockedByDefault: true, colorSwatch: '#d97706', accentColor: 0xf59e0b },
      { id: 'lion_white', name: 'Rare Albino White Lion', price: 500, colorSwatch: '#f8fafc', accentColor: 0xf8fafc },
      { id: 'lion_shadow', name: 'Obsidian Midnight Lion', price: 750, colorSwatch: '#1e293b', accentColor: 0x1e293b },
    ],
  },
  tiger: {
    id: 'tiger',
    name: 'Striped Tiger',
    subtitle: 'Lightning Shadow Apex',
    category: 'ANIMAL',
    price: 1000,
    primaryColor: '#f97316',
    badge: 'Apex Predator',
    ability: 'Lightning Reflexes & Outruns the Chasing Wolf Easily',
    speedBonus: 22,
    coinBonus: 35,
    collectibleName: 'Ruby Fang',
    collectibleEmoji: '💎',
    description: 'Sleek striped assassin of speed with razor-sharp reflexes and top sprint velocity!',
    skins: [
      { id: 'tiger_classic', name: 'Royal Bengal Orange & Stripes', price: 0, unlockedByDefault: true, colorSwatch: '#f97316', accentColor: 0xea580c },
      { id: 'tiger_white', name: 'White Bengal Tiger', price: 600, colorSwatch: '#f1f5f9', accentColor: 0xf1f5f9 },
      { id: 'tiger_gold', name: 'Golden Tabby Tiger', price: 900, colorSwatch: '#facc15', accentColor: 0xfacc15 },
    ],
  },
};

export function createCharacterModel(id: CharacterId): ICharacterModel {
  switch (id) {
    case 'doraemon':
      return new DoraemonModel();
    case 'nobita':
      return new NobitaModel();
    case 'sonic':
      return new SonicModel();
    case 'bheem':
      return new ChhotaBheemModel();
    case 'motu':
      return new MotuModel();
    case 'patlu':
      return new PatluModel();
    case 'ben10':
      return new Ben10Model();
    case 'vir':
      return new VirRobotBoyModel();
    case 'tom':
      return new TomModel();
    case 'jerry':
      return new JerryModel();
    case 'spongebob':
      return new SpongeBobModel();
    case 'minion':
      return new MinionModel();
    case 'lion':
      return new LionModel();
    case 'tiger':
      return new TigerModel();
    case 'shinchan':
    default:
      return new ShinchanModel();
  }
}
