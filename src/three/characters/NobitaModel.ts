import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class NobitaModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private shirtMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Nobita Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffd1b3,
      roughness: 0.55,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright yellow polo shirt
      roughness: 0.7,
    });

    const shortsMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Navy blue shorts
      roughness: 0.7,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
    });

    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.3,
    });

    const glassLensMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
    });

    const sockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 });

    // 1. Torso & Hips
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.75;
    this.group.add(this.bodyGroup);

    // Yellow polo shirt
    this.shirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.6, 14), shirtMat);
    this.shirtMesh.position.y = 0.25;
    this.shirtMesh.castShadow = true;
    this.bodyGroup.add(this.shirtMesh);

    // White shirt collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 6, 16), sockMat);
    collar.position.set(0, 0.55, 0.04);
    collar.rotation.x = Math.PI / 2;
    this.bodyGroup.add(collar);

    // Navy Shorts
    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.32, 14), shortsMat);
    shorts.position.y = -0.15;
    shorts.castShadow = true;
    this.bodyGroup.add(shorts);

    // 2. Head with Big Round Glasses
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.72, 0.02);
    this.bodyGroup.add(this.headGroup);

    // Face
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 16), skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Hair Cap (Neat bowl cut)
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hair.position.y = 0.05;
    hair.rotation.x = -0.1;
    this.headGroup.add(hair);

    // Big Round Glasses Rims
    const glassRimGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 20);
    const rimL = new THREE.Mesh(glassRimGeo, glassesMat);
    rimL.position.set(-0.16, 0.08, 0.4);
    this.headGroup.add(rimL);

    const rimR = new THREE.Mesh(glassRimGeo, glassesMat);
    rimR.position.set(0.16, 0.08, 0.4);
    this.headGroup.add(rimR);

    // Glasses bridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), glassesMat);
    bridge.position.set(0, 0.08, 0.42);
    this.headGroup.add(bridge);

    // Glass lenses
    const lensL = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glassLensMat);
    lensL.position.set(-0.16, 0.08, 0.41);
    this.headGroup.add(lensL);

    const lensR = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glassLensMat);
    lensR.position.set(0.16, 0.08, 0.41);
    this.headGroup.add(lensR);

    // Eyes
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), dotMat);
    eyeL.position.set(-0.16, 0.08, 0.42);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), dotMat);
    eyeR.position.set(0.16, 0.08, 0.42);
    this.headGroup.add(eyeR);

    // 3. Arms
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.18, 12), shirtMat);
      sleeve.position.y = -0.06;
      arm.add(sleeve);

      const bareArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.35, 12), skinMat);
      bareArm.position.y = -0.28;
      arm.add(bareArm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
      hand.position.y = -0.48;
      arm.add(hand);

      arm.position.set(isLeft ? -0.42 : 0.42, 0.42, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Legs
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.32, 12), skinMat);
      legMesh.position.y = -0.12;
      leg.add(legMesh);

      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 12), sockMat);
      sock.position.y = -0.26;
      leg.add(sock);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.28), shoeMat);
      shoe.position.set(0, -0.38, 0.05);
      leg.add(shoe);

      leg.position.set(isLeft ? -0.18 : 0.18, -0.26, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
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

    // Initial forward orientation
    this.group.rotation.set(0, Math.PI, 0);
  }

  public setPowerupActive(active: boolean) {}

  public applySkin(skinId: string) {
    if (skinId.includes('stealth')) {
      (this.shirtMesh.material as THREE.MeshStandardMaterial).color.setHex(0x1e293b);
    } else {
      (this.shirtMesh.material as THREE.MeshStandardMaterial).color.setHex(0xfacc15);
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
    this.bodyGroup.position.set(0, 0.75, 0);
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
      this.runCycleTime += dt * 3.0;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.75 + Math.abs(b) * 0.05;
      this.leftArmGroup.rotation.z = -1.2 + b * 0.2;
      this.rightArmGroup.rotation.z = 1.2 - b * 0.2;
      return;
    }

    if (state === 'SLIDE') {
      this.bodyGroup.position.y = 0.32;
      this.bodyGroup.rotation.x = 1.2;
      this.headGroup.rotation.x = -0.5;
      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftLegGroup.rotation.x = 1.0;
      this.rightLegGroup.rotation.x = 1.0;
      return;
    }

    if (state === 'JUMP') {
      this.bodyGroup.position.y = 0.75;
      this.bodyGroup.rotation.x = 0.15;
      this.headGroup.rotation.x = -0.15;
      this.leftArmGroup.rotation.z = -1.5;
      this.rightArmGroup.rotation.z = 1.5;
      this.leftLegGroup.rotation.x = 0.7;
      this.rightLegGroup.rotation.x = 0.5;
      return;
    }

    // Default RUN: Comical frantic stride
    const freq = 14 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.75 + Math.abs(Math.sin(this.runCycleTime)) * 0.1;
    this.bodyGroup.rotation.x = 0.24; // Frantic forward lean
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.06;

    this.leftLegGroup.rotation.x = legPhase * 0.85;
    this.rightLegGroup.rotation.x = -legPhase * 0.85;

    this.leftArmGroup.rotation.x = -legPhase * 0.9;
    this.rightArmGroup.rotation.x = legPhase * 0.9;
  }
}
