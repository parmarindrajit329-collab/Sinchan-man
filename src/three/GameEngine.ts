import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameState, Lane, GameStats, CharacterId, ActivePowerUp } from '../types/game';
import { ICharacterModel } from './characters/CharacterTypes';
import { createCharacterModel, CHARACTERS } from './characters/CharacterRegistry';
import { WolfModel } from './WolfModel';
import { WorldManager, LANE_POSITIONS } from './WorldManager';
import { sounds } from '../audio/SoundManager';

export class GameEngine {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  // Active Player Character & Chasing Wolf
  public currentCharacterId: CharacterId = 'shinchan';
  public characterModel!: ICharacterModel;
  public wolf!: WolfModel;
  public worldManager!: WorldManager;

  // Visual Shield Bubble
  private shieldMesh!: THREE.Mesh;

  // Game State
  private state: GameState = 'TITLE';
  private onStatsUpdate: (stats: GameStats) => void;
  private onGameOver: (finalStats: GameStats) => void;
  private onAction: (action: 'SLIDE' | 'JUMP' | 'COIN' | 'DISTANCE', amount?: number) => void;

  // Player Kinematics
  private currentLane: Lane = 0;
  private targetX: number = 0;
  private playerX: number = 0;
  private playerZ: number = 0;
  private playerY: number = 0;

  // Wolf Kinematics
  private wolfX: number = 0;
  private wolfZ: number = 5.0;
  private wolfDistance: number = 5.0; // Distance behind player
  private wolfAlertTimer: number = 0;

  // Jump & Slide Physics
  private isJumping: boolean = false;
  private jumpVelocity: number = 0;
  private readonly gravity: number = 42;
  private readonly jumpForce: number = 13.5;

  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private readonly slideDuration: number = 0.65;

  // Speed and Distance
  private baseSpeed: number = 15;
  private currentSpeed: number = 15;
  private distanceTraveled: number = 0;
  private score: number = 0;
  private coinsCollected: number = 0;
  private coinStreak: number = 0;

  // Active Power-ups
  private activePowerUps: ActivePowerUp[] = [];
  private hasShield: boolean = false;
  private invulnerableTimer: number = 0;

  // Camera Shake & Hitstop
  private hitstopTimer: number = 0;
  private cameraShakeIntensity: number = 0;

  // Loop control & Software GL safety
  private frameId: number = 0;
  private lastTime: number = 0;
  private isSoftwareGl: boolean = false;
  private isDestroyed: boolean = false;

  // High score tracking
  private highScore: number = 0;
  private maxDistance: number = 0;
  private totalCoins: number = 0;

  // Particle pool for collection sparks
  private particleGroup!: THREE.Group;
  private activeParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];

  constructor(
    container: HTMLDivElement,
    onStatsUpdate: (stats: GameStats) => void,
    onGameOver: (finalStats: GameStats) => void,
    onAction: (action: 'SLIDE' | 'JUMP' | 'COIN' | 'DISTANCE', amount?: number) => void
  ) {
    this.container = container;
    this.onStatsUpdate = onStatsUpdate;
    this.onGameOver = onGameOver;
    this.onAction = onAction;

    this.highScore = parseInt(localStorage.getItem('shinchan_high_score') || '0', 10);
    this.maxDistance = parseInt(localStorage.getItem('shinchan_max_dist') || '0', 10);
    this.totalCoins = parseInt(localStorage.getItem('shinchan_total_coins') || '0', 10);

    const savedChar = localStorage.getItem('shinchan_selected_char') as CharacterId;
    if (savedChar && CHARACTERS[savedChar]) {
      this.currentCharacterId = savedChar;
    }

    this.init();
  }

  private init() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.scene = new THREE.Scene();
    const skyColor = 0x60a5fa;
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.Fog(skyColor, 40, 160);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 300);
    this.camera.position.set(0, 3.8, 6.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    sunLight.position.set(20, 35, 20);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xfde047, 1.2);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    // Instantiate Character & Wolf
    this.characterModel = createCharacterModel(this.currentCharacterId);
    this.scene.add(this.characterModel.group);

    this.wolf = new WolfModel();
    this.scene.add(this.wolf.group);

    // Shield Energy Bubble
    const shieldGeo = new THREE.SphereGeometry(1.05, 16, 16);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 0.8;
    this.shieldMesh.visible = false;
    this.characterModel.group.add(this.shieldMesh);

    this.worldManager = new WorldManager(this.scene);
    this.worldManager.setCharacter(this.currentCharacterId);

    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    this.setupTitleMode();

    window.addEventListener('resize', this.onResize);
    this.lastTime = performance.now();
    this.tick();
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public selectCharacter(charId: CharacterId) {
    if (this.characterModel) {
      this.characterModel.group.remove(this.shieldMesh);
      this.scene.remove(this.characterModel.group);
    }
    this.currentCharacterId = charId;
    localStorage.setItem('shinchan_selected_char', charId);

    this.characterModel = createCharacterModel(charId);
    this.characterModel.group.rotation.set(0, Math.PI, 0);
    this.characterModel.group.add(this.shieldMesh);
    this.scene.add(this.characterModel.group);

    this.worldManager.setCharacter(charId);

    if (this.state === 'TITLE') {
      this.setupTitleMode();
    }
  }

  public setupTitleMode() {
    this.state = 'TITLE';
    this.currentLane = 0;
    this.playerX = 0;
    this.targetX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.characterModel.group.position.set(0, 0, 0);
    this.characterModel.group.rotation.y = Math.PI; // Face camera!
    this.characterModel.reset();

    // Wolf lurking slightly behind on title screen
    this.wolf.group.position.set(0, 0, 4.5);
    this.wolf.group.rotation.y = Math.PI;
    this.wolf.reset();

    this.camera.position.set(0, 1.5, -3.2);
    this.camera.lookAt(0, 1.0, 0);
  }

  public startGame() {
    this.state = 'PLAYING';
    this.currentLane = 0;
    this.playerX = 0;
    this.targetX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.jumpVelocity = 0;

    const charConfig = CHARACTERS[this.currentCharacterId];
    this.baseSpeed = 15 * (1 + (charConfig?.speedBonus || 0) / 100);
    this.currentSpeed = this.baseSpeed;

    this.distanceTraveled = 0;
    this.score = 0;
    this.coinsCollected = 0;
    this.coinStreak = 0;
    this.hitstopTimer = 0;
    this.cameraShakeIntensity = 0;

    // Wolf reset
    this.wolfDistance = 5.0;
    this.wolfZ = 5.0;
    this.wolfX = 0;
    this.wolfAlertTimer = 0;
    this.wolf.reset();
    this.wolf.group.rotation.set(0, Math.PI, 0);

    // Reset Power-ups
    this.activePowerUps = [];
    this.hasShield = false;
    this.shieldMesh.visible = false;
    this.invulnerableTimer = 0;

    this.characterModel.group.position.set(0, 0, 0);
    this.characterModel.reset();
    this.characterModel.group.rotation.set(0, Math.PI, 0);

    this.worldManager.initWorld();
    sounds.startBGM();
    this.sendStats();
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sounds.stopBGM();
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      sounds.startBGM();
    }
  }

  // --- Controls ---

  public moveLeft() {
    if (this.state !== 'PLAYING') return;
    if (this.currentLane > -1) {
      this.currentLane = (this.currentLane - 1) as Lane;
      this.targetX = LANE_POSITIONS[this.currentLane];
      sounds.playLaneSwitch();
    }
  }

  public moveRight() {
    if (this.state !== 'PLAYING') return;
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as Lane;
      this.targetX = LANE_POSITIONS[this.currentLane];
      sounds.playLaneSwitch();
    }
  }

  public jump() {
    if (this.state !== 'PLAYING') return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpForce;
      this.isSliding = false;
      sounds.playJump();
      this.onAction('JUMP');
    }
  }

  public slide() {
    if (this.state !== 'PLAYING') return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      if (this.isJumping) {
        this.jumpVelocity = -this.jumpForce * 1.5;
      }
      sounds.playSlide();
      this.onAction('SLIDE');
    }
  }

  // --- Particles ---

  private spawnParticles(x: number, y: number, z: number, color: number) {
    const pGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const pMat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.set(x, y, z);
      this.particleGroup.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 4
      );

      this.activeParticles.push({
        mesh,
        vel,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
      });
    }
  }

  private updateParticles(dt: number) {
    this.activeParticles = this.activeParticles.filter((p) => {
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particleGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        return false;
      }
      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.y -= 9.8 * dt;
      const scale = 1 - p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);
      return true;
    });
  }

  // --- Power-Up Activation ---

  private activatePowerUp(type: 'MAGNET' | 'SHIELD' | 'MULTIPLIER') {
    sounds.playPowerup();

    if (type === 'SHIELD') {
      this.hasShield = true;
      this.shieldMesh.visible = true;
    }

    const duration = type === 'SHIELD' ? 12 : 10;
    const existing = this.activePowerUps.find((p) => p.type === type);
    if (existing) {
      existing.remaining = duration;
    } else {
      this.activePowerUps.push({
        type,
        duration,
        remaining: duration,
      });
    }

    this.characterModel.setPowerupActive(true);
  }

  // --- Collision Detection ---

  private checkCollisions(dt: number) {
    const playerHitboxZ = this.playerZ;

    // Check Obstacles
    if (this.invulnerableTimer <= 0) {
      for (const obs of this.worldManager.obstacles) {
        const distZ = Math.abs(obs.z - playerHitboxZ);
        const isSameLane = obs.lane === this.currentLane;

        if (isSameLane && distZ < 0.95) {
          let hit = false;
          if (obs.canJumpOver) {
            if (this.playerY <= 0.75) hit = true;
          } else if (obs.requiresSlide) {
            if (!this.isSliding || this.playerY > 0.25) hit = true;
          } else {
            hit = true;
          }

          if (hit) {
            if (this.hasShield) {
              // Shield breaks and saves player!
              this.hasShield = false;
              this.shieldMesh.visible = false;
              this.invulnerableTimer = 1.2;
              this.activePowerUps = this.activePowerUps.filter((p) => p.type !== 'SHIELD');
              sounds.playShieldBreak();
              this.spawnParticles(this.playerX, this.playerY + 0.8, this.playerZ, 0x10b981);
              // Push wolf back
              this.wolfDistance = Math.min(6.5, this.wolfDistance + 2.0);
              return;
            } else {
              this.handleHit();
              return;
            }
          }
        }
      }
    } else {
      this.invulnerableTimer -= dt;
    }

    // Check Coins & Magnet
    const hasMagnet = this.activePowerUps.some((p) => p.type === 'MAGNET');
    const hasMultiplier = this.activePowerUps.some((p) => p.type === 'MULTIPLIER');

    for (const coin of this.worldManager.coins) {
      if (!coin.collected) {
        // Magnet attraction
        if (hasMagnet) {
          const coinDistToPlayer = Math.abs(coin.z - playerHitboxZ);
          if (coinDistToPlayer < 7.0) {
            // Draw coin towards player
            coin.mesh.position.x = THREE.MathUtils.damp(coin.mesh.position.x, this.playerX, 8, dt);
            coin.mesh.position.y = THREE.MathUtils.damp(coin.mesh.position.y, this.playerY + 0.8, 8, dt);
            coin.mesh.position.z = THREE.MathUtils.damp(coin.mesh.position.z, this.playerZ, 8, dt);
          }
        }

        const distZ = Math.abs(coin.z - playerHitboxZ);
        const distX = Math.abs(coin.mesh.position.x - this.playerX);
        const distY = Math.abs(coin.y - (this.playerY + 0.8));

        if (distZ < 1.1 && distX < 0.85 && distY < 1.2) {
          coin.collected = true;
          this.worldManager.scene.remove(coin.mesh);
          this.coinsCollected++;
          this.coinStreak++;

          const multiplier = (hasMultiplier ? 2 : 1) * Math.min(this.coinStreak, 5);
          this.score += 50 * multiplier;

          sounds.playCoin(this.coinStreak);
          this.spawnParticles(this.playerX, this.playerY + 0.8, this.playerZ, 0xfde047);
          this.onAction('COIN');
          this.sendStats();
        }
      }
    }

    // Check Power-Ups
    for (const pUp of this.worldManager.powerUps) {
      if (!pUp.collected) {
        const distZ = Math.abs(pUp.z - playerHitboxZ);
        const distX = Math.abs(LANE_POSITIONS[pUp.lane] - this.playerX);
        const distY = Math.abs(pUp.y - (this.playerY + 0.8));

        if (distZ < 1.1 && distX < 0.85 && distY < 1.2) {
          pUp.collected = true;
          this.worldManager.scene.remove(pUp.mesh);
          this.activatePowerUp(pUp.type);
          this.spawnParticles(this.playerX, this.playerY + 0.8, this.playerZ, 0x38bdf8);
        }
      }
    }
  }

  private handleHit() {
    this.state = 'GAMEOVER';
    this.hitstopTimer = 0.08;
    this.cameraShakeIntensity = 0.75;

    sounds.stopBGM();
    sounds.playHit();
    sounds.playWolfGrowl();
    setTimeout(() => sounds.playGameOver(), 200);

    // Wolf lunges forward to capture player!
    this.wolf.triggerPounce();
    this.characterModel.triggerHit();

    const charConfig = CHARACTERS[this.currentCharacterId];
    const coinBonus = (charConfig?.coinBonus || 0) / 100;
    const finalCoinsEarned = Math.round(this.coinsCollected * (1 + coinBonus));

    const finalScore = Math.floor(this.score);
    const finalDist = Math.floor(this.distanceTraveled);
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      localStorage.setItem('shinchan_high_score', String(this.highScore));
    }
    if (finalDist > this.maxDistance) {
      this.maxDistance = finalDist;
      localStorage.setItem('shinchan_max_dist', String(this.maxDistance));
    }
    this.totalCoins += finalCoinsEarned;
    localStorage.setItem('shinchan_total_coins', String(this.totalCoins));

    const finalStats: GameStats = {
      score: finalScore,
      coins: finalCoinsEarned,
      distance: finalDist,
      highScore: this.highScore,
      maxDistance: this.maxDistance,
      totalCoins: this.totalCoins,
      selectedCharacter: this.currentCharacterId,
      wolfDistance: 0,
      activePowerUps: [],
      hasShield: false,
    };

    this.onGameOver(finalStats);
  }

  private sendStats() {
    this.onStatsUpdate({
      score: Math.floor(this.score),
      coins: this.coinsCollected,
      distance: Math.floor(this.distanceTraveled),
      highScore: this.highScore,
      maxDistance: this.maxDistance,
      totalCoins: this.totalCoins,
      selectedCharacter: this.currentCharacterId,
      wolfDistance: Math.max(0, Math.round(this.wolfDistance * 10) / 10),
      activePowerUps: this.activePowerUps,
      hasShield: this.hasShield,
    });
  }

  // --- Main Animation & Simulation Tick ---

  private tick = () => {
    if (this.isDestroyed) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(this.tick);
      return;
    }

    if (this.state === 'TITLE') {
      this.characterModel.updateAnimation(dt, 'IDLE', 0, 0, 1.0);
      this.wolf.updateAnimation(dt, 0.8, 5.0);

      const breathe = Math.sin(now * 0.0015);
      this.camera.position.x = breathe * 0.4;
      this.camera.position.y = 1.4 + breathe * 0.08;
      this.camera.lookAt(0, 0.9, 0);

      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(this.tick);
      return;
    }

    if (this.state === 'PLAYING') {
      // 1. Advance Speed & Distance
      this.currentSpeed = Math.min(32, this.baseSpeed + this.distanceTraveled * 0.018);
      const deltaZ = this.currentSpeed * dt;
      this.playerZ -= deltaZ;
      this.distanceTraveled += deltaZ;

      const hasMultiplier = this.activePowerUps.some((p) => p.type === 'MULTIPLIER');
      this.score += deltaZ * 3.5 * (hasMultiplier ? 2 : 1);
      this.onAction('DISTANCE', Math.floor(deltaZ));

      // 2. Power-Up Timers
      this.activePowerUps = this.activePowerUps.filter((p) => {
        p.remaining -= dt;
        return p.remaining > 0;
      });
      if (this.activePowerUps.length === 0 && !this.hasShield) {
        this.characterModel.setPowerupActive(false);
      }

      // 3. Smooth Lane Interpolation
      this.playerX = THREE.MathUtils.damp(this.playerX, this.targetX, 16, dt);

      // 4. Jump Physics
      if (this.isJumping) {
        this.playerY += this.jumpVelocity * dt;
        this.jumpVelocity -= this.gravity * dt;

        if (this.playerY <= 0) {
          this.playerY = 0;
          this.isJumping = false;
          this.jumpVelocity = 0;
        }
      }

      // 5. Slide Timer
      if (this.isSliding) {
        this.slideTimer -= dt;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }

      // 6. Update Player Character
      this.characterModel.group.position.set(this.playerX, this.playerY, this.playerZ);
      const laneBank = (this.targetX - this.playerX) * 0.15;
      this.characterModel.group.rotation.set(0, Math.PI, laneBank);

      const animState = this.isJumping ? 'JUMP' : (this.isSliding ? 'SLIDE' : 'RUN');
      this.characterModel.updateAnimation(
        dt,
        animState,
        this.playerY,
        this.isSliding ? this.slideTimer / this.slideDuration : 0,
        this.currentSpeed / this.baseSpeed
      );

      // 7. Chasing Wolf AI Kinematics!
      // Wolf trails behind player, adjusting distance based on speed and obstacles
      this.wolfDistance = THREE.MathUtils.damp(this.wolfDistance, 4.6, 0.8, dt);
      this.wolfZ = this.playerZ + this.wolfDistance;
      // Wolf smoothly trails into player's lane with dynamic animal drift
      this.wolfX = THREE.MathUtils.damp(this.wolfX, this.playerX, 6.5, dt);
      this.wolf.group.position.set(this.wolfX, 0, this.wolfZ);
      this.wolf.group.rotation.set(0, Math.PI, 0);

      // Wolf growl warning if very close
      if (this.wolfDistance < 2.8) {
        this.wolfAlertTimer += dt;
        if (this.wolfAlertTimer > 2.5) {
          sounds.playWolfGrowl();
          this.wolfAlertTimer = 0;
        }
      }

      this.wolf.updateAnimation(dt, this.currentSpeed / this.baseSpeed, this.wolfDistance);

      // 8. Update World Chunks & Collisions
      this.worldManager.update(this.playerZ, dt);
      this.updateParticles(dt);
      this.checkCollisions(dt);

      // 9. Camera Follow
      const targetCamX = this.playerX * 0.45;
      const targetCamY = 3.8 + (this.isJumping ? this.playerY * 0.4 : 0);
      const targetCamZ = this.playerZ + 6.2;

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 12, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 20, dt);

      if (this.cameraShakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
        this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 3.0);
      }

      this.camera.lookAt(this.playerX * 0.25, 1.4 + this.playerY * 0.3, this.playerZ - 12);
      this.sendStats();
    } else if (this.state === 'GAMEOVER') {
      this.characterModel.group.rotation.set(0, Math.PI, 0);
      this.wolf.group.rotation.set(0, Math.PI, 0);
      this.characterModel.updateAnimation(dt, 'HIT', 0, 0, 1.0);
      this.wolf.updateAnimation(dt, 1.0, 0);
      this.updateParticles(dt);
      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(this.tick);
      return;
    }

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.tick);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    sounds.stopBGM();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
