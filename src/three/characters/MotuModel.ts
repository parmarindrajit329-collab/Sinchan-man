import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class MotuModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private vestMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Motu Palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xedab79,
      roughness: 0.6,
    });

    const vestMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red vest
      roughness: 0.7,
    });

    const pajamaMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Blue pajama
      roughness: 0.7,
    });

    const mustacheMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.8,
    });

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });

    // 1. Torso with Plump Round Belly
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.7;
    this.group.add(this.bodyGroup);

    // Round belly
    const bellyGeo = new THREE.SphereGeometry(0.52, 18, 16);
    bellyGeo.scale(1.1, 1.0, 1.25);
    const belly = new THREE.Mesh(bellyGeo, skinMat);
    belly.position.set(0, 0.22, 0.1);
    belly.castShadow = true;
    this.bodyGroup.add(belly);

    // Red open vest jacket
    this.vestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 0.62, 16, 1, true, 0.3, Math.PI * 1.8), vestMat);
    this.vestMesh.position.set(0, 0.24, 0.05);
    this.vestMesh.castShadow = true;
    this.bodyGroup.add(this.vestMesh);

    // Blue Pajama Pants
    const pajamaGeo = new THREE.CylinderGeometry(0.5, 0.52, 0.35, 14);
    const pajama = new THREE.Mesh(pajamaGeo, pajamaMat);
    pajama.position.y = -0.16;
    pajama.castShadow = true;
    this.bodyGroup.add(pajama);

    // 2. Head with Iconic Mustache & Hair Tuft
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.78, 0.05);
    this.bodyGroup.add(this.headGroup);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 16), skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Single hair tuft (choti) at back
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), mustacheMat);
    tuft.position.set(0, 0.44, -0.2);
    tuft.rotation.x = -0.5;
    this.headGroup.add(tuft);

    // Iconic thick curved black mustache!
    const mustacheGeo = new THREE.CapsuleGeometry(0.06, 0.35, 6, 8);
    mustacheGeo.rotateZ(Math.PI / 2);
    const mustache = new THREE.Mesh(mustacheGeo, mustacheMat);
    mustache.position.set(0, -0.06, 0.44);
    this.headGroup.add(mustache);

    // Big round eyes
    const eyeGeo = new THREE.SphereGeometry(0.09, 10, 10);
    const eyeL = new THREE.Mesh(eyeGeo, whiteMat);
    eyeL.position.set(-0.13, 0.12, 0.4);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, whiteMat);
    eyeR.position.set(0.13, 0.12, 0.4);
    this.headGroup.add(eyeR);

    const pupilGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const pupilL = new THREE.Mesh(pupilGeo, mustacheMat);
    pupilL.position.set(-0.13, 0.12, 0.46);
    this.headGroup.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, mustacheMat);
    pupilR.position.set(0.13, 0.12, 0.46);
    this.headGroup.add(pupilR);

    // 3. Arms
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.35, 12), skinMat);
      upper.position.y = -0.16;
      arm.add(upper);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), skinMat);
      hand.position.y = -0.42;
      arm.add(hand);

      arm.position.set(isLeft ? -0.55 : 0.55, 0.4, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Plump Pajama Legs
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const legPajama = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.32, 12), pajamaMat);
      legPajama.position.y = -0.14;
      leg.add(legPajama);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), shoeMat);
      shoe.position.set(0, -0.34, 0.06);
      leg.add(shoe);

      leg.position.set(isLeft ? -0.22 : 0.22, -0.25, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // Shadow
    const shadowGeo = new THREE.CircleGeometry(0.65, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
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

  public setPowerupActive(active: boolean) {}

  public applySkin(skinId: string) {
    if (skinId.includes('gold')) {
      (this.vestMesh.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
    } else {
      (this.vestMesh.material as THREE.MeshStandardMaterial).color.setHex(0xdc2626);
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
    this.bodyGroup.position.set(0, 0.7, 0);
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
      this.bodyGroup.position.y = 0.7 + Math.abs(b) * 0.06;
      this.leftArmGroup.rotation.z = -1.1 + b * 0.2;
      this.rightArmGroup.rotation.z = 1.1 - b * 0.2;
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
      this.bodyGroup.position.y = 0.7;
      this.bodyGroup.rotation.x = 0.15;
      this.leftArmGroup.rotation.z = -1.4;
      this.rightArmGroup.rotation.z = 1.4;
      this.leftLegGroup.rotation.x = 0.65;
      this.rightLegGroup.rotation.x = 0.65;
      return;
    }

    // Default RUN: Heavy comical bouncing belly run!
    const freq = 13 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.7 + Math.abs(Math.sin(this.runCycleTime)) * 0.14;
    this.bodyGroup.rotation.x = 0.2;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.08;

    this.leftLegGroup.rotation.x = legPhase * 0.85;
    this.rightLegGroup.rotation.x = -legPhase * 0.85;

    this.leftArmGroup.rotation.x = -legPhase * 0.9;
    this.rightArmGroup.rotation.x = legPhase * 0.9;
  }
}
