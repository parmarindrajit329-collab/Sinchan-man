import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class PatluModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private kurtaMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Patlu Palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xedab79,
      roughness: 0.6,
    });

    const kurtaMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright yellow kurta
      roughness: 0.65,
    });

    const pantMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Brown trousers
      roughness: 0.75,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.8,
    });

    // 1. Slender Tall Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.85;
    this.group.add(this.bodyGroup);

    // Long yellow kurta
    this.kurtaMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.8, 14), kurtaMat);
    this.kurtaMesh.position.y = 0.28;
    this.kurtaMesh.castShadow = true;
    this.bodyGroup.add(this.kurtaMesh);

    // Kurta skirt flare
    const flare = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.4, 14, 1, true), kurtaMat);
    flare.position.y = -0.22;
    this.bodyGroup.add(flare);

    // 2. Oval Head with Spectacles
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.82, 0.02);
    this.bodyGroup.add(this.headGroup);

    const headGeo = new THREE.SphereGeometry(0.36, 16, 16);
    headGeo.scale(0.85, 1.25, 0.95);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Bald with thin side/back hair fringe
    const hair = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 16, Math.PI), hairMat);
    hair.position.set(0, 0.1, -0.05);
    this.headGroup.add(hair);

    // Oval Spectacles
    const glassRimGeo = new THREE.TorusGeometry(0.1, 0.02, 6, 16);
    const rimL = new THREE.Mesh(glassRimGeo, hairMat);
    rimL.position.set(-0.13, 0.12, 0.36);
    this.headGroup.add(rimL);

    const rimR = new THREE.Mesh(glassRimGeo, hairMat);
    rimR.position.set(0.13, 0.12, 0.36);
    this.headGroup.add(rimR);

    // Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.06, 0.44);
    this.headGroup.add(nose);

    // 3. Lean Long Arms
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.35, 12), kurtaMat);
      sleeve.position.y = -0.16;
      arm.add(sleeve);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.35, 12), skinMat);
      forearm.position.y = -0.45;
      arm.add(forearm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
      hand.position.y = -0.65;
      arm.add(hand);

      arm.position.set(isLeft ? -0.32 : 0.32, 0.55, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Slender Legs
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.55, 12), pantMat);
      legMesh.position.y = -0.28;
      leg.add(legMesh);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.28), hairMat);
      shoe.position.set(0, -0.6, 0.06);
      leg.add(shoe);

      leg.position.set(isLeft ? -0.16 : 0.16, -0.3, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // Shadow
    const shadowGeo = new THREE.CircleGeometry(0.48, 20);
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

  public setPowerupActive(active: boolean) {}

  public applySkin(skinId: string) {
    if (skinId.includes('blue')) {
      (this.kurtaMesh.material as THREE.MeshStandardMaterial).color.setHex(0x0ea5e9);
    } else {
      (this.kurtaMesh.material as THREE.MeshStandardMaterial).color.setHex(0xfacc15);
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
    this.bodyGroup.position.set(0, 0.85, 0);
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
      this.bodyGroup.position.y = 0.85 + Math.abs(b) * 0.04;
      this.leftArmGroup.rotation.x = b * 0.3;
      this.rightArmGroup.rotation.x = -b * 0.3;
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
      this.bodyGroup.position.y = 0.85;
      this.bodyGroup.rotation.x = 0.15;
      this.leftArmGroup.rotation.z = -1.5;
      this.rightArmGroup.rotation.z = 1.5;
      this.leftLegGroup.rotation.x = 0.7;
      this.rightLegGroup.rotation.x = 0.4;
      return;
    }

    // Default RUN: Quick intelligent agile stride
    const freq = 15 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.85 + Math.abs(Math.sin(this.runCycleTime)) * 0.1;
    this.bodyGroup.rotation.x = 0.22;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.04;

    this.leftLegGroup.rotation.x = legPhase * 0.9;
    this.rightLegGroup.rotation.x = -legPhase * 0.9;

    this.leftArmGroup.rotation.x = -legPhase * 0.95;
    this.rightArmGroup.rotation.x = legPhase * 0.95;
  }
}
