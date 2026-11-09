import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class VirRobotBoyModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private jetpackGroup: THREE.Group;
  private visorMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Vir The Robot Boy Palette
    const suitRedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Bright superhero red suit
      roughness: 0.35,
      metalness: 0.3,
    });

    const suitYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // High-contrast yellow chest stripes
      roughness: 0.35,
      metalness: 0.2,
    });

    const robotMetalMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Titanium gray robotic joints
      metalness: 0.8,
      roughness: 0.25,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      roughness: 0.5,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });

    // 1. Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.78;
    this.group.add(this.bodyGroup);

    // Red superhero chest
    const chestGeo = new THREE.BoxGeometry(0.68, 0.65, 0.44);
    const chest = new THREE.Mesh(chestGeo, suitRedMat);
    chest.position.y = 0.25;
    chest.castShadow = true;
    this.bodyGroup.add(chest);

    // Yellow V-chest emblem
    const vGeo = new THREE.BoxGeometry(0.35, 0.45, 0.04);
    const vEmblem = new THREE.Mesh(vGeo, suitYellowMat);
    vEmblem.position.set(0, 0.26, 0.23);
    this.bodyGroup.add(vEmblem);

    // Cyan arc reactor / power core in chest center
    const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, cyanGlowMat);
    core.position.set(0, 0.28, 0.26);
    this.bodyGroup.add(core);

    // Belt & Pelvis
    const beltGeo = new THREE.BoxGeometry(0.66, 0.18, 0.42);
    const belt = new THREE.Mesh(beltGeo, suitYellowMat);
    belt.position.y = -0.12;
    this.bodyGroup.add(belt);

    // High-tech Jetpack on back
    this.jetpackGroup = new THREE.Group();
    this.jetpackGroup.position.set(0, 0.24, -0.28);
    this.bodyGroup.add(this.jetpackGroup);

    const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.5, 12);
    const thrusterL = new THREE.Mesh(thrusterGeo, robotMetalMat);
    thrusterL.position.x = -0.18;
    this.jetpackGroup.add(thrusterL);

    const thrusterR = new THREE.Mesh(thrusterGeo, robotMetalMat);
    thrusterR.position.x = 0.18;
    this.jetpackGroup.add(thrusterR);

    // Thruster cyan nozzle flames
    const flameGeo = new THREE.ConeGeometry(0.09, 0.25, 8);
    flameGeo.rotateX(Math.PI);
    const flameL = new THREE.Mesh(flameGeo, cyanGlowMat);
    flameL.position.set(-0.18, -0.32, 0);
    this.jetpackGroup.add(flameL);

    const flameR = new THREE.Mesh(flameGeo, cyanGlowMat);
    flameR.position.set(0.18, -0.32, 0);
    this.jetpackGroup.add(flameR);

    // 2. Head with High-Tech Visor
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.72, 0.02);
    this.bodyGroup.add(this.headGroup);

    // Face
    const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Spiky Robotic Hero Hair
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    hairCap.position.y = 0.05;
    this.headGroup.add(hairCap);

    // Hair spike tips
    for (let s = -2; s <= 2; s++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 4), hairMat);
      spike.position.set(s * 0.12, 0.4, 0.1 - Math.abs(s) * 0.05);
      spike.rotation.x = -0.3;
      spike.rotation.z = -s * 0.2;
      this.headGroup.add(spike);
    }

    // Glowing Cyber Visor
    const visorGeo = new THREE.BoxGeometry(0.6, 0.16, 0.2);
    this.visorMesh = new THREE.Mesh(visorGeo, cyanGlowMat);
    this.visorMesh.position.set(0, 0.08, 0.32);
    this.headGroup.add(this.visorMesh);

    // 3. Robotic Gauntlet Arms
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      // Red upper arm
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.32, 12), suitRedMat);
      upperArm.position.y = -0.15;
      arm.add(upperArm);

      // Robotic elbow joint
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), robotMetalMat);
      elbow.position.y = -0.3;
      arm.add(elbow);

      // Yellow cyber gauntlet
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.28, 12), suitYellowMat);
      forearm.position.y = -0.45;
      arm.add(forearm);

      // Metal robotic fist
      const fist = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.2), robotMetalMat);
      fist.position.y = -0.62;
      arm.add(fist);

      arm.position.set(isLeft ? -0.46 : 0.46, 0.42, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Power Running Boots
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      // Red thigh
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.35, 12), suitRedMat);
      thigh.position.y = -0.16;
      leg.add(thigh);

      // Knee joint
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), robotMetalMat);
      knee.position.y = -0.35;
      leg.add(knee);

      // Yellow & Red Cyber Boot
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.34), suitYellowMat);
      boot.position.set(0, -0.52, 0.05);
      leg.add(boot);

      leg.position.set(isLeft ? -0.2 : 0.2, -0.25, 0);
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
    (this.visorMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = active ? 1.5 : 0.8;
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
      // High-tech cyber salute pose
      this.leftArmGroup.rotation.x = -1.2;
      this.leftArmGroup.rotation.z = -0.5;
      this.rightArmGroup.rotation.z = 0.5;
      return;
    }

    if (state === 'SLIDE') {
      // Hover skate slide low
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
      // Jetpack thruster flight!
      this.bodyGroup.position.y = 0.78;
      this.bodyGroup.rotation.x = 0.28;
      this.leftArmGroup.rotation.x = -1.8;
      this.rightArmGroup.rotation.x = -1.8;
      this.leftLegGroup.rotation.x = 0.6;
      this.rightLegGroup.rotation.x = 0.6;
      return;
    }

    // Default RUN: Aerodynamic high-tech sprint
    const freq = 15 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.78 + Math.abs(Math.sin(this.runCycleTime)) * 0.1;
    this.bodyGroup.rotation.x = 0.28; // Dynamic forward aerodynamic lean
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.04;

    this.leftLegGroup.rotation.x = legPhase * 0.9;
    this.rightLegGroup.rotation.x = -legPhase * 0.9;

    this.leftArmGroup.rotation.x = -legPhase * 0.95;
    this.rightArmGroup.rotation.x = legPhase * 0.95;
  }
}
