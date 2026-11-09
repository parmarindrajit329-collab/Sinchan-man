import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class ChhotaBheemModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private dhotiMat: THREE.MeshStandardMaterial;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Bheem Palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xedab79, // Indian tan skin
      roughness: 0.6,
      metalness: 0.05,
    });

    this.dhotiMat = new THREE.MeshStandardMaterial({
      color: 0xea580c, // Rich saffron / orange dhoti
      roughness: 0.75,
      metalness: 0.05,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Golden jewelry & borders
      metalness: 0.85,
      roughness: 0.25,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
    });

    const tilakMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red tilak
      roughness: 0.4,
    });

    // 1. Torso (muscular athletic build)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.8;
    this.group.add(this.bodyGroup);

    // Bare chest & torso
    const chestGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.65, 14);
    const chest = new THREE.Mesh(chestGeo, skinMat);
    chest.position.y = 0.25;
    chest.castShadow = true;
    this.bodyGroup.add(chest);

    // Gold necklace / garland
    const necklaceGeo = new THREE.TorusGeometry(0.36, 0.04, 6, 20);
    necklaceGeo.rotateX(Math.PI / 2);
    const necklace = new THREE.Mesh(necklaceGeo, goldMat);
    necklace.position.y = 0.52;
    this.bodyGroup.add(necklace);

    // Orange Dhoti (waist and pleated cloth)
    const dhotiGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.45, 14);
    const dhoti = new THREE.Mesh(dhotiGeo, this.dhotiMat);
    dhoti.position.y = -0.2;
    dhoti.castShadow = true;
    this.bodyGroup.add(dhoti);

    // Gold waist belt
    const beltGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 14);
    const belt = new THREE.Mesh(beltGeo, goldMat);
    belt.position.y = -0.02;
    this.bodyGroup.add(belt);

    // 2. Head & Hair Knot
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.72, 0.02);
    this.bodyGroup.add(this.headGroup);

    // Face
    const headGeo = new THREE.SphereGeometry(0.42, 18, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Black Hair & Knot (Shikha)
    const hairCapGeo = new THREE.SphereGeometry(0.44, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.y = 0.05;
    this.headGroup.add(hairCap);

    // Hair top knot (Choti / Bun)
    const knotGeo = new THREE.SphereGeometry(0.16, 10, 10);
    const knot = new THREE.Mesh(knotGeo, hairMat);
    knot.position.set(0, 0.45, -0.15);
    this.headGroup.add(knot);

    // Sacred Red Tilak on forehead
    const tilakGeo = new THREE.BoxGeometry(0.06, 0.16, 0.02);
    const tilak = new THREE.Mesh(tilakGeo, tilakMat);
    tilak.position.set(0, 0.16, 0.42);
    this.headGroup.add(tilak);

    // Eyes
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshStandardMaterial({ color: 0x09090b });

    const eyeGeo = new THREE.SphereGeometry(0.08, 10, 10);
    eyeGeo.scale(1.0, 1.2, 0.4);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.14, 0.06, 0.4);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.14, 0.06, 0.4);
    this.headGroup.add(rightEye);

    const pupilGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const leftPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    leftPupil.position.set(-0.14, 0.06, 0.43);
    this.headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    rightPupil.position.set(0.14, 0.06, 0.43);
    this.headGroup.add(rightPupil);

    // 3. Arms with Gold Armlets
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      // Muscular shoulder & arm
      const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.38, 12), skinMat);
      bicep.position.y = -0.18;
      bicep.castShadow = true;
      arm.add(bicep);

      // Gold armband
      const armband = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 12), goldMat);
      armband.position.y = -0.12;
      arm.add(armband);

      // Forearm & Gold Wristband
      const wristband = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), goldMat);
      wristband.position.y = -0.32;
      arm.add(wristband);

      // Clenched Heroic Fist
      const fist = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), skinMat);
      fist.position.y = -0.42;
      arm.add(fist);

      arm.position.set(isLeft ? -0.44 : 0.44, 0.42, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Legs in Dhoti folds
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      // Upper leg in dhoti
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.35, 12), this.dhotiMat);
      upperLeg.position.y = -0.16;
      upperLeg.castShadow = true;
      leg.add(upperLeg);

      // Bare lower calf
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.32, 12), skinMat);
      calf.position.y = -0.42;
      leg.add(calf);

      // Foot
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.3), skinMat);
      foot.position.set(0, -0.58, 0.06);
      leg.add(foot);

      leg.position.set(isLeft ? -0.2 : 0.2, -0.35, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // 5. Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  public setPowerupActive(active: boolean) {
    // Laddoo energy glow
  }

  public applySkin(skinId: string) {
    if (skinId.includes('gold') || skinId.includes('royal')) {
      // Royal Dholakpur Gold Silk Dhoti
      this.dhotiMat.color.setHex(0xfacc15);
      this.dhotiMat.metalness = 0.55;
      this.dhotiMat.roughness = 0.25;
    } else if (skinId.includes('warrior') || skinId.includes('crimson')) {
      // Crimson Battle Dhoti
      this.dhotiMat.color.setHex(0xdc2626);
      this.dhotiMat.metalness = 0.1;
      this.dhotiMat.roughness = 0.7;
    } else {
      // Classic Saffron Dhoti
      this.dhotiMat.color.setHex(0xea580c);
      this.dhotiMat.metalness = 0.05;
      this.dhotiMat.roughness = 0.75;
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
      this.runCycleTime += dt * 2.8;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.8 + Math.abs(b) * 0.05;
      // Flexing biceps pose
      this.leftArmGroup.rotation.z = -1.2 + b * 0.2;
      this.leftArmGroup.rotation.x = 0.5;
      this.rightArmGroup.rotation.z = 1.2 - b * 0.2;
      this.rightArmGroup.rotation.x = 0.5;
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
      this.bodyGroup.position.y = 0.8;
      this.bodyGroup.rotation.x = 0.2;
      // Sky punch leap!
      this.leftArmGroup.rotation.x = -2.4; // Punch to sky
      this.rightArmGroup.rotation.x = 0.4;
      this.leftLegGroup.rotation.x = 0.8;
      this.rightLegGroup.rotation.x = 0.3;
      return;
    }

    // Default RUN: Heroic powerful runner
    const freq = 14 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.8 + Math.abs(Math.sin(this.runCycleTime)) * 0.12;
    this.bodyGroup.rotation.x = 0.22;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.05;

    this.leftLegGroup.rotation.x = legPhase * 0.9;
    this.rightLegGroup.rotation.x = -legPhase * 0.9;

    this.leftArmGroup.rotation.x = -legPhase * 0.95;
    this.rightArmGroup.rotation.x = legPhase * 0.95;
  }
}
