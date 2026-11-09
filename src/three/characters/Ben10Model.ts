import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class Ben10Model implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private omnitrixDial: THREE.Mesh;
  private shirtMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Ben 10 Palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      roughness: 0.55,
    });

    const shirtWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.65,
    });

    const blackStripeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.6,
    });

    const cargoGreenMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Dark olive / cargo green
      roughness: 0.75,
    });

    const hairBrownMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Shaggy brown hair
      roughness: 0.8,
    });

    const omnitrixGreenMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x4ade80,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // 1. Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.78;
    this.group.add(this.bodyGroup);

    // White shirt
    this.shirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.62, 14), shirtWhiteMat);
    this.shirtMesh.position.y = 0.25;
    this.shirtMesh.castShadow = true;
    this.bodyGroup.add(this.shirtMesh);

    // Iconic vertical black stripe running down center
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.63, 0.38), blackStripeMat);
    stripe.position.set(0, 0.25, 0.01);
    this.bodyGroup.add(stripe);

    // Black horizontal collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 6, 16), blackStripeMat);
    collar.position.set(0, 0.56, 0.02);
    collar.rotation.x = Math.PI / 2;
    this.bodyGroup.add(collar);

    // Cargo belt & hips
    const pants = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.36, 0.26, 14), cargoGreenMat);
    pants.position.y = -0.12;
    pants.castShadow = true;
    this.bodyGroup.add(pants);

    // 2. Head & Shaggy Hair
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.75, 0.02);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 16), skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Shaggy hair
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairBrownMat
    );
    hair.position.y = 0.06;
    this.headGroup.add(hair);

    // Green eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x16a34a });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    eyeL.position.set(-0.14, 0.06, 0.38);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    eyeR.position.set(0.14, 0.06, 0.38);
    this.headGroup.add(eyeR);

    // 3. Arms & Glowing Omnitrix
    // Left Arm (with Omnitrix!)
    this.leftArmGroup = new THREE.Group();
    const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12), blackStripeMat);
    lSleeve.position.y = -0.06;
    this.leftArmGroup.add(lSleeve);

    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.34, 12), skinMat);
    lForearm.position.y = -0.26;
    this.leftArmGroup.add(lForearm);

    // The Omnitrix!
    const omnitrixBand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 12), blackStripeMat);
    omnitrixBand.position.y = -0.32;
    this.leftArmGroup.add(omnitrixBand);

    this.omnitrixDial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), omnitrixGreenMat);
    this.omnitrixDial.position.set(0, -0.32, 0.12);
    this.omnitrixDial.rotation.x = Math.PI / 2;
    this.leftArmGroup.add(this.omnitrixDial);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
    lHand.position.y = -0.46;
    this.leftArmGroup.add(lHand);

    this.leftArmGroup.position.set(-0.44, 0.42, 0);
    this.bodyGroup.add(this.leftArmGroup);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12), blackStripeMat);
    rSleeve.position.y = -0.06;
    this.rightArmGroup.add(rSleeve);

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.34, 12), skinMat);
    rForearm.position.y = -0.26;
    this.rightArmGroup.add(rForearm);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
    rHand.position.y = -0.46;
    this.rightArmGroup.add(rHand);

    this.rightArmGroup.position.set(0.44, 0.42, 0);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Cargo Pants Legs & Sneakers
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.36, 12), cargoGreenMat);
      thigh.position.y = -0.16;
      leg.add(thigh);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.32), blackStripeMat);
      boot.position.set(0, -0.42, 0.05);
      leg.add(boot);

      leg.position.set(isLeft ? -0.18 : 0.18, -0.22, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // Shadow
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

    this.group.rotation.set(0, Math.PI, 0);
  }

  public setPowerupActive(active: boolean) {
    (this.omnitrixDial.material as THREE.MeshStandardMaterial).emissiveIntensity = active ? 1.6 : 0.8;
  }

  public applySkin(skinId: string) {
    if (skinId.includes('alien')) {
      (this.shirtMesh.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e);
    } else {
      (this.shirtMesh.material as THREE.MeshStandardMaterial).color.setHex(0xf8fafc);
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
      this.runCycleTime += dt * 2.8;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.78 + Math.abs(b) * 0.05;
      // Tap Omnitrix pose
      this.leftArmGroup.rotation.x = -1.1 + b * 0.1;
      this.rightArmGroup.rotation.x = -0.8;
      this.rightArmGroup.rotation.z = -0.4;
      return;
    }

    if (state === 'SLIDE') {
      this.bodyGroup.position.y = 0.32;
      this.bodyGroup.rotation.x = 1.25;
      this.headGroup.rotation.x = -0.5;
      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftLegGroup.rotation.x = 1.0;
      this.rightLegGroup.rotation.x = 1.0;
      return;
    }

    if (state === 'JUMP') {
      this.bodyGroup.position.y = 0.78;
      this.bodyGroup.rotation.x = 0.2;
      this.leftArmGroup.rotation.x = -2.0; // Heroic fist forward
      this.rightArmGroup.rotation.x = 0.4;
      this.leftLegGroup.rotation.x = 0.75;
      this.rightLegGroup.rotation.x = 0.4;
      return;
    }

    // Default RUN: Dynamic superhero sprint
    const freq = 14 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.78 + Math.abs(Math.sin(this.runCycleTime)) * 0.11;
    this.bodyGroup.rotation.x = 0.22;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.04;

    this.leftLegGroup.rotation.x = legPhase * 0.88;
    this.rightLegGroup.rotation.x = -legPhase * 0.88;

    this.leftArmGroup.rotation.x = -legPhase * 0.92;
    this.rightArmGroup.rotation.x = legPhase * 0.92;
  }
}
