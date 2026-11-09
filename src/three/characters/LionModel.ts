import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class LionModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private frontLeftLeg: THREE.Group;
  private frontRightLeg: THREE.Group;
  private backLeftLeg: THREE.Group;
  private backRightLeg: THREE.Group;
  private tailGroup: THREE.Group;
  private maneGroup: THREE.Group;
  private furMat: THREE.MeshStandardMaterial;
  private maneMat: THREE.MeshStandardMaterial;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Lion Palette
    this.furMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm golden tawny fur
      roughness: 0.75,
      metalness: 0.05,
    });

    this.maneMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Deep regal brown mane
      roughness: 0.85,
      flatShading: true,
    });

    const muzzleMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7, // Pale cream muzzle
      roughness: 0.8,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.3,
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });

    // 1. Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.8;
    this.group.add(this.bodyGroup);

    // Deep chest
    const chestGeo = new THREE.BoxGeometry(0.72, 0.7, 0.95);
    const chest = new THREE.Mesh(chestGeo, this.furMat);
    chest.position.set(0, 0.1, 0.25);
    chest.castShadow = true;
    this.bodyGroup.add(chest);

    // Lean flank & hips
    const flankGeo = new THREE.BoxGeometry(0.64, 0.62, 0.85);
    const flank = new THREE.Mesh(flankGeo, this.furMat);
    flank.position.set(0, 0.08, -0.5);
    flank.castShadow = true;
    this.bodyGroup.add(flank);

    // 2. Head with Majestic Fluffy Mane
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.45, 0.8);
    this.bodyGroup.add(this.headGroup);

    // Skull
    const headGeo = new THREE.SphereGeometry(0.38, 14, 14);
    const head = new THREE.Mesh(headGeo, this.furMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Big Fluffy Mane ring
    this.maneGroup = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), this.maneMat);
      puff.position.set(Math.cos(angle) * 0.44, Math.sin(angle) * 0.44, -0.05);
      this.maneGroup.add(puff);
    }
    this.headGroup.add(this.maneGroup);

    // Muzzle
    const muzzleGeo = new THREE.BoxGeometry(0.34, 0.26, 0.38);
    const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
    muzzle.position.set(0, -0.08, 0.32);
    this.headGroup.add(muzzle);

    // Black Nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.1), noseMat);
    nose.position.set(0, 0.02, 0.52);
    this.headGroup.add(nose);

    // Amber Eyes
    const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.16, 0.1, 0.28);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.16, 0.1, 0.28);
    this.headGroup.add(rightEye);

    // Rounded Lion Ears
    const earGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const earL = new THREE.Mesh(earGeo, this.furMat);
    earL.position.set(-0.28, 0.34, -0.02);
    this.headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, this.furMat);
    earR.position.set(0.28, 0.34, -0.02);
    this.headGroup.add(earR);

    // 3. Four Powerful Feline Legs
    const makeLeg = () => {
      const leg = new THREE.Group();
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.26), this.furMat);
      thigh.position.y = -0.2;
      thigh.castShadow = true;
      leg.add(thigh);

      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.18), this.furMat);
      shin.position.set(0, -0.5, 0.04);
      leg.add(shin);

      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.26), muzzleMat);
      paw.position.set(0, -0.7, 0.1);
      leg.add(paw);

      return leg;
    };

    this.frontLeftLeg = makeLeg();
    this.frontLeftLeg.position.set(-0.34, -0.05, 0.5);
    this.bodyGroup.add(this.frontLeftLeg);

    this.frontRightLeg = makeLeg();
    this.frontRightLeg.position.set(0.34, -0.05, 0.5);
    this.bodyGroup.add(this.frontRightLeg);

    this.backLeftLeg = makeLeg();
    this.backLeftLeg.position.set(-0.32, -0.05, -0.65);
    this.bodyGroup.add(this.backLeftLeg);

    this.backRightLeg = makeLeg();
    this.backRightLeg.position.set(0.32, -0.05, -0.65);
    this.bodyGroup.add(this.backRightLeg);

    // 4. Tufted Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.2, -0.9);
    this.bodyGroup.add(this.tailGroup);

    const tailGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.7, 8);
    tailGeo.rotateX(-Math.PI * 0.3);
    const tailShaft = new THREE.Mesh(tailGeo, this.furMat);
    tailShaft.position.set(0, -0.2, -0.25);
    this.tailGroup.add(tailShaft);

    // Dark tuft at end
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this.maneMat);
    tuft.position.set(0, -0.42, -0.52);
    this.tailGroup.add(tuft);

    // 5. Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.75, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    this.shadowMesh = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  public setPowerupActive(active: boolean) {
    // Golden royal aura
  }

  public applySkin(skinId: string) {
    if (skinId.includes('white') || skinId.includes('albino')) {
      // Rare White Albino Lion
      this.furMat.color.setHex(0xf8fafc);
      this.maneMat.color.setHex(0xd1d5db);
    } else if (skinId.includes('shadow') || skinId.includes('black')) {
      // Shadow Obsidian Lion
      this.furMat.color.setHex(0x1f2937);
      this.maneMat.color.setHex(0x0f172a);
    } else {
      // Classic Tawny Gold
      this.furMat.color.setHex(0xf59e0b);
      this.maneMat.color.setHex(0x78350f);
    }
  }

  public triggerHit() {
    this.isHit = true;
    this.hitTimer = 0;
  }

  public reset() {
    this.isHit = false;
    this.hitTimer = 0;
    this.runCycleTime = 0;
    this.group.rotation.set(0, Math.PI, 0);
    this.bodyGroup.position.set(0, 0.8, 0);
  }

  public updateAnimation(
    dt: number,
    state: 'RUN' | 'JUMP' | 'SLIDE' | 'IDLE' | 'HIT',
    jumpY: number,
    slideProgress: number,
    speedMultiplier: number
  ) {
    if (this.isHit) {
      this.hitTimer += dt;
      this.bodyGroup.rotation.y += dt * 8;
      this.bodyGroup.rotation.x = Math.sin(this.hitTimer * 10) * 0.4;
      return;
    }

    if (state === 'IDLE') {
      this.runCycleTime += dt * 2.5;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.8 + Math.abs(b) * 0.04;
      this.headGroup.rotation.y = b * 0.25;
      this.tailGroup.rotation.y = Math.sin(this.runCycleTime * 2) * 0.4;
      return;
    }

    if (state === 'SLIDE') {
      this.bodyGroup.position.y = 0.35;
      this.bodyGroup.rotation.x = 0.6;
      this.frontLeftLeg.rotation.x = 1.0;
      this.frontRightLeg.rotation.x = 1.0;
      this.backLeftLeg.rotation.x = -0.8;
      this.backRightLeg.rotation.x = -0.8;
      return;
    }

    if (state === 'JUMP') {
      this.bodyGroup.position.y = 0.8;
      this.bodyGroup.rotation.x = 0.25;
      this.frontLeftLeg.rotation.x = -1.2;
      this.frontRightLeg.rotation.x = -1.2;
      this.backLeftLeg.rotation.x = 0.6;
      this.backRightLeg.rotation.x = 0.6;
      return;
    }

    // Default RUN: Feline predatory gallop
    const freq = 16 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const bound = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.8 + Math.abs(bound) * 0.14;
    this.bodyGroup.rotation.x = bound * 0.1;

    this.frontLeftLeg.rotation.x = Math.sin(this.runCycleTime) * 1.0;
    this.frontRightLeg.rotation.x = Math.sin(this.runCycleTime + 0.3) * 0.95;
    this.backLeftLeg.rotation.x = -Math.sin(this.runCycleTime) * 1.05;
    this.backRightLeg.rotation.x = -Math.sin(this.runCycleTime + 0.3) * 1.0;

    this.tailGroup.rotation.x = bound * 0.25;
    this.tailGroup.rotation.y = Math.cos(this.runCycleTime * 0.5) * 0.3;
  }
}
