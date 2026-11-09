import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class TomModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private tailGroup: THREE.Group;
  private furMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Tom Cat Palette
    const catGreyMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Classic blue-grey cat fur
      roughness: 0.65,
      metalness: 0.05,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.5,
    });

    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.6,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.3,
    });

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    // 1. Torso with White Chest
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.8;
    this.group.add(this.bodyGroup);

    this.furMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.7, 14), catGreyMat);
    this.furMesh.position.y = 0.28;
    this.furMesh.castShadow = true;
    this.bodyGroup.add(this.furMesh);

    // White belly patch
    const whiteChest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), whiteMat);
    whiteChest.scale.set(1.0, 1.2, 0.4);
    whiteChest.position.set(0, 0.26, 0.2);
    this.bodyGroup.add(whiteChest);

    // 2. Feline Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.76, 0.02);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), catGreyMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // White Muzzle
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.24), whiteMat);
    muzzle.position.set(0, -0.08, 0.32);
    this.headGroup.add(muzzle);

    // Pink nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), noseMat);
    nose.position.set(0, 0, 0.44);
    this.headGroup.add(nose);

    // Pointed Cat Ears
    const earGeo = new THREE.ConeGeometry(0.14, 0.36, 4);
    const earL = new THREE.Mesh(earGeo, catGreyMat);
    earL.position.set(-0.24, 0.38, 0);
    earL.rotation.z = 0.2;
    this.headGroup.add(earL);

    const innerL = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.22), innerEarMat);
    innerL.position.set(-0.23, 0.38, 0.08);
    this.headGroup.add(innerL);

    const earR = new THREE.Mesh(earGeo, catGreyMat);
    earR.position.set(0.24, 0.38, 0);
    earR.rotation.z = -0.2;
    this.headGroup.add(earR);

    const innerR = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.22), innerEarMat);
    innerR.position.set(0.23, 0.38, 0.08);
    this.headGroup.add(innerR);

    // Yellow cartoon cat eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 10, 10);
    eyeGeo.scale(0.8, 1.2, 0.3);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.12, 0.1, 0.38);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.12, 0.1, 0.38);
    this.headGroup.add(eyeR);

    const pL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupilMat);
    pL.position.set(-0.12, 0.1, 0.42);
    this.headGroup.add(pL);

    const pR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupilMat);
    pR.position.set(0.12, 0.1, 0.42);
    this.headGroup.add(pR);

    // 3. Cat Paws / Arms
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 12), catGreyMat);
      armMesh.position.y = -0.22;
      arm.add(armMesh);

      const whitePaw = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), whiteMat);
      whitePaw.position.y = -0.48;
      arm.add(whitePaw);

      arm.position.set(isLeft ? -0.4 : 0.4, 0.5, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Cat Legs
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.42, 12), catGreyMat);
      thigh.position.y = -0.2;
      leg.add(thigh);

      const whiteFoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.32), whiteMat);
      whiteFoot.position.set(0, -0.45, 0.06);
      leg.add(whiteFoot);

      leg.position.set(isLeft ? -0.18 : 0.18, -0.05, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // 5. Long Animated Feline Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.05, -0.3);
    this.bodyGroup.add(this.tailGroup);

    const tailGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.75, 8);
    tailGeo.rotateX(-Math.PI * 0.35);
    const tailMesh = new THREE.Mesh(tailGeo, catGreyMat);
    tailMesh.position.set(0, 0.2, -0.25);
    this.tailGroup.add(tailMesh);

    // White tail tip
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), whiteMat);
    tip.position.set(0, 0.45, -0.5);
    this.tailGroup.add(tip);

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

  public setPowerupActive(active: boolean) {}

  public applySkin(skinId: string) {
    if (skinId.includes('black')) {
      (this.furMesh.material as THREE.MeshStandardMaterial).color.setHex(0x18181b);
    } else {
      (this.furMesh.material as THREE.MeshStandardMaterial).color.setHex(0x64748b);
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
      this.bodyGroup.position.y = 0.8 + Math.abs(b) * 0.04;
      this.tailGroup.rotation.y = Math.sin(this.runCycleTime * 2) * 0.4;
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
      this.bodyGroup.position.y = 0.8;
      this.bodyGroup.rotation.x = 0.2;
      this.leftArmGroup.rotation.z = -1.5;
      this.rightArmGroup.rotation.z = 1.5;
      this.leftLegGroup.rotation.x = 0.6;
      this.rightLegGroup.rotation.x = 0.6;
      return;
    }

    // Default RUN: Playful cartoon feline sprint
    const freq = 16 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.8 + Math.abs(Math.sin(this.runCycleTime)) * 0.12;
    this.bodyGroup.rotation.x = 0.24;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.05;

    this.leftLegGroup.rotation.x = legPhase * 0.9;
    this.rightLegGroup.rotation.x = -legPhase * 0.9;

    this.leftArmGroup.rotation.x = -legPhase * 0.95;
    this.rightArmGroup.rotation.x = legPhase * 0.95;

    this.tailGroup.rotation.x = Math.sin(this.runCycleTime) * 0.3;
    this.tailGroup.rotation.y = Math.cos(this.runCycleTime * 0.5) * 0.4;
  }
}
