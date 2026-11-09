import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class SpongeBobModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private noseMesh: THREE.Mesh;
  private spongeBodyMesh: THREE.Mesh;
  private chefHatGroup: THREE.Group;

  private spongeMat: THREE.MeshStandardMaterial;
  private shirtMat: THREE.MeshStandardMaterial;
  private pantsMat: THREE.MeshStandardMaterial;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // SpongeBob Materials
    this.spongeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Vibrant sponge yellow
      roughness: 0.65,
      metalness: 0.05,
    });

    const poreMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // Darker olive green-yellow for sponge pores
      roughness: 0.8,
    });

    this.shirtMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });

    const tieMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Crimson red necktie
      roughness: 0.35,
    });

    this.pantsMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Brown rectangular trousers
      roughness: 0.7,
    });

    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Black belt dashes
      roughness: 0.5,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Shiny black shoes
      roughness: 0.25,
      metalness: 0.3,
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Sky cyan-blue irises
      roughness: 0.3,
    });

    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
    });

    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xf87171, // Rosy freckled cheeks
      roughness: 0.6,
    });

    const toothMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    // 1. Root Body Group
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.75;
    this.group.add(this.bodyGroup);

    // 2. Yellow Rectangular Sponge Body
    this.spongeBodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.62, 0.42),
      this.spongeMat
    );
    this.spongeBodyMesh.position.y = 0.28;
    this.spongeBodyMesh.castShadow = true;
    this.bodyGroup.add(this.spongeBodyMesh);

    // Sponge Pores (scattered indentations)
    const poreOffsets = [
      [-0.24, 0.45, 0.215, 0.04],
      [0.22, 0.48, 0.215, 0.05],
      [-0.26, 0.15, 0.215, 0.035],
      [0.25, 0.18, 0.215, 0.045],
      [-0.1, 0.52, 0.215, 0.03],
      [-0.345, 0.35, 0, 0.04],
      [0.345, 0.4, 0.05, 0.045],
    ];
    poreOffsets.forEach(([px, py, pz, r]) => {
      const pore = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), poreMat);
      pore.position.set(px, py, pz);
      pore.scale.set(1, 1, 0.3);
      this.bodyGroup.add(pore);
    });

    // 3. Face Features (facing +Z)
    this.headGroup = new THREE.Group();
    this.bodyGroup.add(this.headGroup);

    // Big round cartoon eyes
    const eyeGeo = new THREE.SphereGeometry(0.125, 16, 16);
    const irisGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(0.03, 10, 10);

    // Left Eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.13, 0.36, 0.21);
    leftEye.scale.set(1, 1.08, 0.7);
    this.headGroup.add(leftEye);

    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    leftIris.position.set(-0.13, 0.36, 0.28);
    leftIris.scale.set(1, 1, 0.3);
    this.headGroup.add(leftIris);

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.13, 0.36, 0.295);
    leftPupil.scale.set(1, 1, 0.3);
    this.headGroup.add(leftPupil);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.13, 0.36, 0.21);
    rightEye.scale.set(1, 1.08, 0.7);
    this.headGroup.add(rightEye);

    const rightIris = new THREE.Mesh(irisGeo, irisMat);
    rightIris.position.set(0.13, 0.36, 0.28);
    rightIris.scale.set(1, 1, 0.3);
    this.headGroup.add(rightIris);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.13, 0.36, 0.295);
    rightPupil.scale.set(1, 1, 0.3);
    this.headGroup.add(rightPupil);

    // Lashes (3 black dashes above each eye)
    const lashMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    [-0.18, -0.13, -0.08, 0.08, 0.13, 0.18].forEach((lx) => {
      const lash = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.05, 0.02), lashMat);
      lash.position.set(lx, 0.49, 0.23);
      lash.rotation.z = lx < 0 ? 0.2 : -0.2;
      this.headGroup.add(lash);
    });

    // Long Protruding Cylindrical Nose
    this.noseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.038, 0.22, 12),
      this.spongeMat
    );
    this.noseMesh.rotation.x = Math.PI / 2;
    this.noseMesh.position.set(0, 0.29, 0.3);
    this.headGroup.add(this.noseMesh);

    // Rosy Cheeks
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), cheekMat);
    leftCheek.position.set(-0.25, 0.24, 0.22);
    leftCheek.scale.set(1, 0.7, 0.4);
    this.headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), cheekMat);
    rightCheek.position.set(0.25, 0.24, 0.22);
    rightCheek.scale.set(1, 0.7, 0.4);
    this.headGroup.add(rightCheek);

    // Wide Smile & Two Buck Teeth
    const smileMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.018, 8, 16, Math.PI),
      pupilMat
    );
    smileMesh.rotation.z = Math.PI;
    smileMesh.position.set(0, 0.24, 0.22);
    this.headGroup.add(smileMesh);

    // Buck Teeth
    const leftTooth = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 0.02), toothMat);
    leftTooth.position.set(-0.032, 0.18, 0.225);
    this.headGroup.add(leftTooth);

    const rightTooth = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 0.02), toothMat);
    rightTooth.position.set(0.032, 0.18, 0.225);
    this.headGroup.add(rightTooth);

    // 4. White Shirt & Red Necktie
    const shirtMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.12, 0.42),
      this.shirtMat
    );
    shirtMesh.position.y = -0.07;
    shirtMesh.castShadow = true;
    this.bodyGroup.add(shirtMesh);

    // Red necktie
    const tieKnot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), tieMat);
    tieKnot.position.set(0, -0.04, 0.225);
    this.bodyGroup.add(tieKnot);

    const tieBody = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 4), tieMat);
    tieBody.rotation.z = Math.PI;
    tieBody.position.set(0, -0.11, 0.225);
    this.bodyGroup.add(tieBody);

    // 5. Brown Rectangular Trousers
    const pantsMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.14, 0.42),
      this.pantsMat
    );
    pantsMesh.position.y = -0.18;
    pantsMesh.castShadow = true;
    this.bodyGroup.add(pantsMesh);

    // Black belt dashes
    [-0.22, -0.09, 0.09, 0.22].forEach((bx) => {
      const beltDash = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.02), beltMat);
      beltDash.position.set(bx, -0.14, 0.22);
      this.bodyGroup.add(beltDash);
    });

    // 6. Arms
    const armGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.32, 8);
    const sleeveGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 8);
    const handGeo = new THREE.SphereGeometry(0.055, 10, 10);

    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.38, -0.06, 0);
    this.bodyGroup.add(this.leftArmGroup);

    const leftSleeve = new THREE.Mesh(sleeveGeo, this.shirtMat);
    leftSleeve.rotation.z = Math.PI / 4;
    this.leftArmGroup.add(leftSleeve);

    const leftArm = new THREE.Mesh(armGeo, this.spongeMat);
    leftArm.position.set(-0.06, -0.16, 0);
    this.leftArmGroup.add(leftArm);

    const leftHand = new THREE.Mesh(handGeo, this.spongeMat);
    leftHand.position.set(-0.06, -0.32, 0);
    this.leftArmGroup.add(leftHand);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.38, -0.06, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rightSleeve = new THREE.Mesh(sleeveGeo, this.shirtMat);
    rightSleeve.rotation.z = -Math.PI / 4;
    this.rightArmGroup.add(rightSleeve);

    const rightArm = new THREE.Mesh(armGeo, this.spongeMat);
    rightArm.position.set(0.06, -0.16, 0);
    this.rightArmGroup.add(rightArm);

    const rightHand = new THREE.Mesh(handGeo, this.spongeMat);
    rightHand.position.set(0.06, -0.32, 0);
    this.rightArmGroup.add(rightHand);

    // 7. Legs (Slender legs with white socks & black shoes)
    const legGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.28, 8);
    const sockGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.12, 8);
    const shoeGeo = new THREE.BoxGeometry(0.085, 0.075, 0.16);

    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.15, -0.25, 0);
    this.bodyGroup.add(this.leftLegGroup);

    const leftLeg = new THREE.Mesh(legGeo, this.spongeMat);
    leftLeg.position.y = -0.14;
    this.leftLegGroup.add(leftLeg);

    const leftSock = new THREE.Mesh(sockGeo, this.shirtMat);
    leftSock.position.y = -0.18;
    this.leftLegGroup.add(leftSock);

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.28, 0.04);
    leftShoe.castShadow = true;
    this.leftLegGroup.add(leftShoe);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.15, -0.25, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rightLeg = new THREE.Mesh(legGeo, this.spongeMat);
    rightLeg.position.y = -0.14;
    this.rightLegGroup.add(rightLeg);

    const rightSock = new THREE.Mesh(sockGeo, this.shirtMat);
    rightSock.position.y = -0.18;
    this.rightLegGroup.add(rightSock);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.28, 0.04);
    rightShoe.castShadow = true;
    this.rightLegGroup.add(rightShoe);

    // 8. Unlockable Skin: Krusty Krab Chef Hat
    this.chefHatGroup = new THREE.Group();
    this.chefHatGroup.position.set(0, 0.62, 0.02);
    this.chefHatGroup.visible = false;
    this.headGroup.add(this.chefHatGroup);

    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    this.chefHatGroup.add(hatBrim);

    const hatCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    hatCrown.position.y = 0.1;
    this.chefHatGroup.add(hatCrown);

    const anchorEmblem = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.012, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    anchorEmblem.position.set(0, 0.1, 0.17);
    this.chefHatGroup.add(anchorEmblem);

    // Shadow
    const shadowGeo = new THREE.PlaneGeometry(0.85, 0.85);
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
      this.spongeMat.emissive = new THREE.Color(0xfacc15);
      this.spongeMat.emissiveIntensity = 0.4;
    } else {
      this.spongeMat.emissive = new THREE.Color(0x000000);
      this.spongeMat.emissiveIntensity = 0;
    }
  }

  public applySkin(skinId: string) {
    if (skinId.includes('chef') || skinId.includes('krusty')) {
      this.chefHatGroup.visible = true;
      this.spongeMat.color.setHex(0xfde047);
      this.pantsMat.color.setHex(0x78350f);
    } else if (skinId.includes('gold')) {
      this.chefHatGroup.visible = false;
      this.spongeMat.color.setHex(0xf59e0b);
      this.spongeMat.metalness = 0.5;
      this.spongeMat.roughness = 0.25;
      this.pantsMat.color.setHex(0xd97706);
    } else {
      // Classic
      this.chefHatGroup.visible = false;
      this.spongeMat.color.setHex(0xfacc15);
      this.spongeMat.metalness = 0.05;
      this.spongeMat.roughness = 0.65;
      this.pantsMat.color.setHex(0x78350f);
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
      this.noseMesh.rotation.y = Math.sin(this.hitTimer * 20) * 0.4;
      return;
    }

    if (state === 'IDLE') {
      this.runCycleTime += dt * 3.5;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.75 + Math.abs(b) * 0.05;
      this.bodyGroup.rotation.y = b * 0.15;
      this.leftArmGroup.rotation.x = 0.3 + b * 0.2;
      this.rightArmGroup.rotation.x = -0.3 - b * 0.2;
      this.noseMesh.rotation.z = b * 0.1;
      return;
    }

    if (state === 'SLIDE') {
      // Hydroplane belly slide!
      this.bodyGroup.position.y = 0.25;
      this.bodyGroup.rotation.x = -1.25; // Leaning low forward
      this.leftArmGroup.rotation.x = 1.4;
      this.rightArmGroup.rotation.x = 1.4;
      this.leftLegGroup.rotation.x = -0.8;
      this.rightLegGroup.rotation.x = -0.8;
      return;
    }

    if (state === 'JUMP') {
      // Cheerful starfish leap!
      this.bodyGroup.position.y = 0.75;
      this.bodyGroup.rotation.x = 0;
      this.leftArmGroup.rotation.z = -1.6;
      this.rightArmGroup.rotation.z = 1.6;
      this.leftLegGroup.rotation.z = -0.4;
      this.rightLegGroup.rotation.z = 0.4;
      this.noseMesh.rotation.x = (Math.PI / 2) + 0.2;
      return;
    }

    // Default RUN: High-kicking funny energetic strides
    const freq = 13 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);
    const armPhase = Math.sin(this.runCycleTime + Math.PI);

    this.bodyGroup.position.y = 0.75 + Math.abs(Math.sin(this.runCycleTime)) * 0.08;
    this.bodyGroup.rotation.x = 0.12; // Eager slight forward tilt
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime * 0.5) * 0.06;

    // High knee kicking
    this.leftLegGroup.rotation.x = legPhase * 0.9;
    this.rightLegGroup.rotation.x = -legPhase * 0.9;

    // Slender arms waving
    this.leftArmGroup.rotation.x = armPhase * 0.85;
    this.rightArmGroup.rotation.x = -armPhase * 0.85;

    // Nose bobbing
    this.noseMesh.rotation.z = Math.sin(this.runCycleTime) * 0.08;
  }
}
