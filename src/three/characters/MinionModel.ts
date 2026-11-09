import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class MinionModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private hairsGroup: THREE.Group;

  private bodyMat: THREE.MeshStandardMaterial;
  private overallsMat: THREE.MeshStandardMaterial;
  private goggleMat: THREE.MeshStandardMaterial;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Minion Palette
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Minion signature bright yellow
      roughness: 0.5,
      metalness: 0.05,
    });

    this.overallsMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Denim blue overalls
      roughness: 0.65,
    });

    this.goggleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Metallic silver goggles
      metalness: 0.85,
      roughness: 0.25,
    });

    const lensMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.1,
      metalness: 0.1,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e, // Warm hazel-brown eyes
      roughness: 0.4,
    });

    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
    });

    const strapMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Black goggle strap & gloves/boots
      roughness: 0.6,
    });

    // 1. Root Body Group
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.65;
    this.group.add(this.bodyGroup);

    // 2. Yellow Capsule / Pill Body
    const pillGeo = new THREE.CapsuleGeometry(0.28, 0.45, 12, 16);
    const pillMesh = new THREE.Mesh(pillGeo, this.bodyMat);
    pillMesh.castShadow = true;
    this.bodyGroup.add(pillMesh);

    // 3. Head & Goggles (facing +Z)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.18;
    this.bodyGroup.add(this.headGroup);

    // Black elastic goggle strap wrapping around head
    const strapGeo = new THREE.TorusGeometry(0.285, 0.035, 8, 24);
    const strapMesh = new THREE.Mesh(strapGeo, strapMat);
    strapMesh.rotation.x = Math.PI / 2;
    this.headGroup.add(strapMesh);

    // Dual Goggles (Two eyes)
    const goggleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
    const eyeWhiteGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
    const irisGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12);
    const pupilGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.045, 10);

    // Left Goggle
    const leftGoggle = new THREE.Mesh(goggleGeo, this.goggleMat);
    leftGoggle.rotation.x = Math.PI / 2;
    leftGoggle.position.set(-0.09, 0, 0.26);
    this.headGroup.add(leftGoggle);

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, lensMat);
    leftEyeWhite.rotation.x = Math.PI / 2;
    leftEyeWhite.position.set(-0.09, 0, 0.29);
    this.headGroup.add(leftEyeWhite);

    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    leftIris.rotation.x = Math.PI / 2;
    leftIris.position.set(-0.09, 0, 0.3);
    this.headGroup.add(leftIris);

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.rotation.x = Math.PI / 2;
    leftPupil.position.set(-0.09, 0, 0.305);
    this.headGroup.add(leftPupil);

    // Right Goggle
    const rightGoggle = new THREE.Mesh(goggleGeo, this.goggleMat);
    rightGoggle.rotation.x = Math.PI / 2;
    rightGoggle.position.set(0.09, 0, 0.26);
    this.headGroup.add(rightGoggle);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, lensMat);
    rightEyeWhite.rotation.x = Math.PI / 2;
    rightEyeWhite.position.set(0.09, 0, 0.29);
    this.headGroup.add(rightEyeWhite);

    const rightIris = new THREE.Mesh(irisGeo, irisMat);
    rightIris.rotation.x = Math.PI / 2;
    rightIris.position.set(0.09, 0, 0.3);
    this.headGroup.add(rightIris);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.rotation.x = Math.PI / 2;
    rightPupil.position.set(0.09, 0, 0.305);
    this.headGroup.add(rightPupil);

    // Cheerful Smile
    const smileGeo = new THREE.TorusGeometry(0.08, 0.016, 6, 12, Math.PI);
    const smile = new THREE.Mesh(smileGeo, pupilMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, -0.15, 0.26);
    this.headGroup.add(smile);

    // Spiky Hairs on top of head
    this.hairsGroup = new THREE.Group();
    this.hairsGroup.position.set(0, 0.42, 0);
    this.headGroup.add(this.hairsGroup);

    const hairGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4);
    [-0.06, -0.02, 0.02, 0.06].forEach((hx, i) => {
      const hair = new THREE.Mesh(hairGeo, strapMat);
      hair.position.set(hx, 0.04, 0);
      hair.rotation.z = (i - 1.5) * 0.15;
      this.hairsGroup.add(hair);
    });

    // 4. Denim Blue Overalls
    const overallsGeo = new THREE.CylinderGeometry(0.285, 0.285, 0.26, 16);
    const overallsMesh = new THREE.Mesh(overallsGeo, this.overallsMat);
    overallsMesh.position.y = -0.15;
    overallsMesh.castShadow = true;
    this.bodyGroup.add(overallsMesh);

    // Front pocket with 'G' emblem
    const pocketGeo = new THREE.BoxGeometry(0.14, 0.1, 0.02);
    const pocketMesh = new THREE.Mesh(pocketGeo, this.overallsMat);
    pocketMesh.position.set(0, -0.12, 0.28);
    this.bodyGroup.add(pocketMesh);

    const emblemGeo = new THREE.TorusGeometry(0.026, 0.008, 6, 12);
    const emblemMesh = new THREE.Mesh(emblemGeo, strapMat);
    emblemMesh.position.set(0, -0.12, 0.292);
    this.bodyGroup.add(emblemMesh);

    // Suspenders
    const suspGeo = new THREE.BoxGeometry(0.045, 0.35, 0.02);
    const leftSusp = new THREE.Mesh(suspGeo, this.overallsMat);
    leftSusp.position.set(-0.16, 0.04, 0.18);
    leftSusp.rotation.z = -0.25;
    leftSusp.rotation.x = -0.15;
    this.bodyGroup.add(leftSusp);

    const rightSusp = new THREE.Mesh(suspGeo, this.overallsMat);
    rightSusp.position.set(0.16, 0.04, 0.18);
    rightSusp.rotation.z = 0.25;
    rightSusp.rotation.x = -0.15;
    this.bodyGroup.add(rightSusp);

    // 5. Arms & Black 3-finger gloves
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.24, 8);
    const gloveGeo = new THREE.SphereGeometry(0.065, 8, 8);

    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.31, 0, 0);
    this.bodyGroup.add(this.leftArmGroup);

    const leftArm = new THREE.Mesh(armGeo, this.bodyMat);
    leftArm.position.y = -0.12;
    this.leftArmGroup.add(leftArm);

    const leftGlove = new THREE.Mesh(gloveGeo, strapMat);
    leftGlove.position.y = -0.24;
    this.leftArmGroup.add(leftGlove);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.31, 0, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rightArm = new THREE.Mesh(armGeo, this.bodyMat);
    rightArm.position.y = -0.12;
    this.rightArmGroup.add(rightArm);

    const rightGlove = new THREE.Mesh(gloveGeo, strapMat);
    rightGlove.position.y = -0.24;
    this.rightArmGroup.add(rightGlove);

    // 6. Stubby Legs & Black Boots
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8);
    const bootGeo = new THREE.BoxGeometry(0.1, 0.09, 0.15);

    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.11, -0.32, 0);
    this.bodyGroup.add(this.leftLegGroup);

    const leftLeg = new THREE.Mesh(legGeo, this.overallsMat);
    leftLeg.position.y = -0.06;
    this.leftLegGroup.add(leftLeg);

    const leftBoot = new THREE.Mesh(bootGeo, strapMat);
    leftBoot.position.set(0, -0.12, 0.03);
    leftBoot.castShadow = true;
    this.leftLegGroup.add(leftBoot);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.11, -0.32, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rightLeg = new THREE.Mesh(legGeo, this.overallsMat);
    rightLeg.position.y = -0.06;
    this.rightLegGroup.add(rightLeg);

    const rightBoot = new THREE.Mesh(bootGeo, strapMat);
    rightBoot.position.set(0, -0.12, 0.03);
    rightBoot.castShadow = true;
    this.rightLegGroup.add(rightBoot);

    // Shadow
    const shadowGeo = new THREE.PlaneGeometry(0.7, 0.7);
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

    // Game-wide forward orientation: rotation.y = Math.PI
    this.group.rotation.set(0, Math.PI, 0);
  }

  public setPowerupActive(active: boolean) {
    if (active) {
      this.goggleMat.emissive = new THREE.Color(0xfacc15);
      this.goggleMat.emissiveIntensity = 0.5;
    } else {
      this.goggleMat.emissive = new THREE.Color(0x000000);
      this.goggleMat.emissiveIntensity = 0;
    }
  }

  public applySkin(skinId: string) {
    if (skinId.includes('purple') || skinId.includes('evil')) {
      // Evil Purple Minion!
      this.bodyMat.color.setHex(0x9333ea);
      this.overallsMat.color.setHex(0x3b0764);
    } else if (skinId.includes('gold')) {
      // Golden Minion
      this.bodyMat.color.setHex(0xf59e0b);
      this.bodyMat.metalness = 0.6;
      this.bodyMat.roughness = 0.2;
      this.overallsMat.color.setHex(0xb45309);
    } else {
      // Classic Yellow & Denim
      this.bodyMat.color.setHex(0xfacc15);
      this.bodyMat.metalness = 0.05;
      this.bodyMat.roughness = 0.5;
      this.overallsMat.color.setHex(0x1d4ed8);
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
    this.bodyGroup.position.set(0, 0.65, 0);
    this.bodyGroup.rotation.set(0, 0, 0);
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
      this.runCycleTime += dt * 3.5;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.65 + Math.abs(b) * 0.04;
      this.bodyGroup.rotation.y = b * 0.2;
      this.leftArmGroup.rotation.z = -0.3 + b * 0.15;
      this.rightArmGroup.rotation.z = 0.3 - b * 0.15;
      return;
    }

    if (state === 'SLIDE') {
      // Torpedo belly slide!
      this.bodyGroup.position.y = 0.25;
      this.bodyGroup.rotation.x = -1.3;
      this.leftArmGroup.rotation.x = 1.2;
      this.rightArmGroup.rotation.x = 1.2;
      this.leftLegGroup.rotation.x = -0.6;
      this.rightLegGroup.rotation.x = -0.6;
      return;
    }

    if (state === 'JUMP') {
      // Rocket leap!
      this.bodyGroup.position.y = 0.65;
      this.bodyGroup.rotation.x = 0;
      this.leftArmGroup.rotation.x = -1.6;
      this.rightArmGroup.rotation.x = -1.6;
      this.leftLegGroup.rotation.x = 0.4;
      this.rightLegGroup.rotation.x = 0.4;
      return;
    }

    // Default RUN: Comical rapid waddle run
    const freq = 16 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);
    const armPhase = Math.sin(this.runCycleTime + Math.PI);

    this.bodyGroup.position.y = 0.65 + Math.abs(Math.sin(this.runCycleTime)) * 0.08;
    this.bodyGroup.rotation.x = 0.18; // Leaning forward in full sprint
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime * 0.5) * 0.12; // Side-to-side waddle

    // Quick stubby legs
    this.leftLegGroup.rotation.x = legPhase * 0.8;
    this.rightLegGroup.rotation.x = -legPhase * 0.8;

    // Windmill arms
    this.leftArmGroup.rotation.x = armPhase * 1.1;
    this.rightArmGroup.rotation.x = -armPhase * 1.1;
  }
}
