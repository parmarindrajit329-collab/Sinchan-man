import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class TigerModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private frontLeftLeg: THREE.Group;
  private frontRightLeg: THREE.Group;
  private backLeftLeg: THREE.Group;
  private backRightLeg: THREE.Group;
  private tailGroup: THREE.Group;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Procedural striped tiger texture
    const tigerCanvas = document.createElement('canvas');
    tigerCanvas.width = 128;
    tigerCanvas.height = 128;
    const ctx = tigerCanvas.getContext('2d')!;
    // Orange background
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, 0, 128, 128);
    // Black stripes
    ctx.fillStyle = '#18181b';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      const y = i * 20 + 5;
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(64, y + 8, 128, y);
      ctx.lineTo(128, y + 7);
      ctx.quadraticCurveTo(64, y + 15, 0, y + 7);
      ctx.fill();
    }
    const tigerTex = new THREE.CanvasTexture(tigerCanvas);
    tigerTex.colorSpace = THREE.SRGBColorSpace;
    tigerTex.wrapS = THREE.RepeatWrapping;
    tigerTex.wrapT = THREE.RepeatWrapping;

    const tigerMat = new THREE.MeshStandardMaterial({
      map: tigerTex,
      roughness: 0.7,
      metalness: 0.05,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.75,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16, // Green feline predator eyes
      emissive: 0x4d7c0f,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    });

    // 1. Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.78;
    this.group.add(this.bodyGroup);

    // Sleek muscular chest
    const chestGeo = new THREE.BoxGeometry(0.7, 0.68, 0.95);
    const chest = new THREE.Mesh(chestGeo, tigerMat);
    chest.position.set(0, 0.1, 0.25);
    chest.castShadow = true;
    this.bodyGroup.add(chest);

    // White underbelly
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.9), whiteMat);
    belly.position.set(0, -0.22, 0.25);
    this.bodyGroup.add(belly);

    // Hips
    const flankGeo = new THREE.BoxGeometry(0.62, 0.6, 0.85);
    const flank = new THREE.Mesh(flankGeo, tigerMat);
    flank.position.set(0, 0.08, -0.5);
    flank.castShadow = true;
    this.bodyGroup.add(flank);

    // 2. Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.42, 0.8);
    this.bodyGroup.add(this.headGroup);

    // Skull
    const headGeo = new THREE.SphereGeometry(0.38, 14, 14);
    const head = new THREE.Mesh(headGeo, tigerMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // White Muzzle
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.35), whiteMat);
    muzzle.position.set(0, -0.08, 0.3);
    this.headGroup.add(muzzle);

    // Pink nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.1), noseMat);
    nose.position.set(0, 0.02, 0.48);
    this.headGroup.add(nose);

    // Emerald Green Eyes
    const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 0.1, 0.28);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 0.1, 0.28);
    this.headGroup.add(rightEye);

    // Striped Ears
    const earGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const earL = new THREE.Mesh(earGeo, tigerMat);
    earL.position.set(-0.26, 0.32, 0);
    this.headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, tigerMat);
    earR.position.set(0.26, 0.32, 0);
    this.headGroup.add(earR);

    // 3. Four Striped Running Legs
    const makeLeg = () => {
      const leg = new THREE.Group();
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.24), tigerMat);
      thigh.position.y = -0.2;
      thigh.castShadow = true;
      leg.add(thigh);

      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.18), tigerMat);
      shin.position.set(0, -0.5, 0.04);
      leg.add(shin);

      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.24), whiteMat);
      paw.position.set(0, -0.7, 0.1);
      leg.add(paw);

      return leg;
    };

    this.frontLeftLeg = makeLeg();
    this.frontLeftLeg.position.set(-0.32, -0.05, 0.5);
    this.bodyGroup.add(this.frontLeftLeg);

    this.frontRightLeg = makeLeg();
    this.frontRightLeg.position.set(0.32, -0.05, 0.5);
    this.bodyGroup.add(this.frontRightLeg);

    this.backLeftLeg = makeLeg();
    this.backLeftLeg.position.set(-0.3, -0.05, -0.65);
    this.bodyGroup.add(this.backLeftLeg);

    this.backRightLeg = makeLeg();
    this.backRightLeg.position.set(0.3, -0.05, -0.65);
    this.bodyGroup.add(this.backRightLeg);

    // 4. Striped Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.2, -0.9);
    this.bodyGroup.add(this.tailGroup);

    const tailGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.8, 8);
    tailGeo.rotateX(-Math.PI * 0.35);
    const tailShaft = new THREE.Mesh(tailGeo, tigerMat);
    tailShaft.position.set(0, -0.22, -0.3);
    this.tailGroup.add(tailShaft);

    // 5. Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.75, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctxS = shadowCanvas.getContext('2d')!;
    const grad = ctxS.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxS.fillStyle = grad;
    ctxS.fillRect(0, 0, 64, 64);

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
    // Lightning speed aura
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
    this.bodyGroup.position.set(0, 0.78, 0);
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
      this.bodyGroup.position.y = 0.78 + Math.abs(b) * 0.04;
      this.headGroup.rotation.y = b * 0.2;
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
      this.bodyGroup.position.y = 0.78;
      this.bodyGroup.rotation.x = 0.25;
      this.frontLeftLeg.rotation.x = -1.2;
      this.frontRightLeg.rotation.x = -1.2;
      this.backLeftLeg.rotation.x = 0.6;
      this.backRightLeg.rotation.x = 0.6;
      return;
    }

    // Default RUN: High-speed agile sprint
    const freq = 17 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const bound = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.78 + Math.abs(bound) * 0.15;
    this.bodyGroup.rotation.x = bound * 0.1;

    this.frontLeftLeg.rotation.x = Math.sin(this.runCycleTime) * 1.05;
    this.frontRightLeg.rotation.x = Math.sin(this.runCycleTime + 0.3) * 1.0;
    this.backLeftLeg.rotation.x = -Math.sin(this.runCycleTime) * 1.1;
    this.backRightLeg.rotation.x = -Math.sin(this.runCycleTime + 0.3) * 1.05;

    this.tailGroup.rotation.x = bound * 0.25;
    this.tailGroup.rotation.y = Math.cos(this.runCycleTime * 0.5) * 0.35;
  }
}
