import * as THREE from 'three';
import { ICharacterModel } from './characters/CharacterTypes';

export class ShinchanModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  // Sub-parts for animation
  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private leftEyebrow: THREE.Mesh;
  private rightEyebrow: THREE.Mesh;
  private capeGroup: THREE.Group;
  private shirtMat: THREE.MeshStandardMaterial;
  private shortsMat: THREE.MeshStandardMaterial;

  // State
  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Palettes (Shinchan colors)
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffd1b3, // Warm anime peach skin
      roughness: 0.55,
      metalness: 0.05,
    });

    this.shirtMat = new THREE.MeshStandardMaterial({
      color: 0xef233c, // Bright iconic red shirt
      roughness: 0.75,
      metalness: 0.05,
    });

    this.shortsMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Bright yellow shorts
      roughness: 0.7,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Jet black hair
      roughness: 0.85,
      metalness: 0.1,
    });

    const eyebrowMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Deep black eyebrows
      roughness: 0.9,
      metalness: 0.0,
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.0,
    });

    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
      metalness: 0.0,
    });

    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // Cute rosy cheek blush
      roughness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239, // Mouth interior
      roughness: 0.5,
    });

    const sockMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.7,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Yellow/amber sneakers
      roughness: 0.6,
      metalness: 0.1,
    });

    const soleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
    });

    // 1. Root body group (pivoted near pelvis)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.75;
    this.group.add(this.bodyGroup);

    // Torso (plump cartoon body with red shirt)
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.65, 16);
    const torso = new THREE.Mesh(torsoGeo, this.shirtMat);
    torso.castShadow = true;
    torso.receiveShadow = true;
    torso.position.y = 0.25;
    this.bodyGroup.add(torso);

    // Yellow shorts
    const shortsGeo = new THREE.CylinderGeometry(0.43, 0.45, 0.35, 16);
    const shorts = new THREE.Mesh(shortsGeo, this.shortsMat);
    shorts.castShadow = true;
    shorts.position.y = -0.15;
    this.bodyGroup.add(shorts);

    // 2. Head Group (iconic chubby cheeks and profile)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.68, 0.04);
    this.bodyGroup.add(this.headGroup);

    // Main head shape: slightly wider at cheeks
    const headGeo = new THREE.SphereGeometry(0.48, 20, 18);
    headGeo.scale(1.12, 0.95, 1.05);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Chubby left & right cheek bulges
    const cheekGeo = new THREE.SphereGeometry(0.26, 14, 14);
    cheekGeo.scale(1.1, 0.85, 1.0);
    const leftCheek = new THREE.Mesh(cheekGeo, skinMat);
    leftCheek.position.set(-0.35, -0.06, 0.12);
    this.headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, skinMat);
    rightCheek.position.set(0.35, -0.06, 0.12);
    this.headGroup.add(rightCheek);

    // Blushing spots
    const blushGeo = new THREE.CircleGeometry(0.1, 14);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.38, -0.04, 0.34);
    leftBlush.rotation.y = -0.3;
    this.headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.38, -0.04, 0.34);
    rightBlush.rotation.y = 0.3;
    this.headGroup.add(rightBlush);

    // Hair cap (Shinchan's cropped black hair)
    const hairGeo = new THREE.SphereGeometry(0.5, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
    hairGeo.scale(1.14, 0.98, 1.06);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.04, -0.04);
    hair.rotation.x = -0.15;
    this.headGroup.add(hair);

    // Hair sideburns
    const sideburnGeo = new THREE.BoxGeometry(0.14, 0.28, 0.2);
    const leftSideburn = new THREE.Mesh(sideburnGeo, hairMat);
    leftSideburn.position.set(-0.48, 0.05, -0.05);
    this.headGroup.add(leftSideburn);

    const rightSideburn = new THREE.Mesh(sideburnGeo, hairMat);
    rightSideburn.position.set(0.48, 0.05, -0.05);
    this.headGroup.add(rightSideburn);

    // Signature thick arched eyebrows!
    const eyebrowGeo = new THREE.CapsuleGeometry(0.06, 0.24, 8, 12);
    this.leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
    this.leftEyebrow.position.set(-0.2, 0.22, 0.44);
    this.leftEyebrow.rotation.z = -0.35;
    this.leftEyebrow.rotation.x = 0.18;
    this.headGroup.add(this.leftEyebrow);

    this.rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
    this.rightEyebrow.position.set(0.2, 0.22, 0.44);
    this.rightEyebrow.rotation.z = 0.35;
    this.rightEyebrow.rotation.x = 0.18;
    this.headGroup.add(this.rightEyebrow);

    // Cartoon Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 14, 14);
    eyeGeo.scale(0.85, 1.15, 0.4);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.19, 0.07, 0.45);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.19, 0.07, 0.45);
    this.headGroup.add(rightEye);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.065, 12, 12);
    pupilGeo.scale(0.9, 1.1, 0.3);

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.19, 0.06, 0.49);
    this.headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.19, 0.06, 0.49);
    this.headGroup.add(rightPupil);

    // Catchlight dots in eyes
    const dotGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const leftDot = new THREE.Mesh(dotGeo, eyeWhiteMat);
    leftDot.position.set(-0.17, 0.09, 0.51);
    this.headGroup.add(leftDot);

    const rightDot = new THREE.Mesh(dotGeo, eyeWhiteMat);
    rightDot.position.set(0.21, 0.09, 0.51);
    this.headGroup.add(rightDot);

    // Cheerful mouth
    const mouthGeo = new THREE.CylinderGeometry(0.14, 0.02, 0.1, 12, 1, false, 0, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.16, 0.46);
    mouth.rotation.x = Math.PI * 0.55;
    this.headGroup.add(mouth);

    // 3. Arms (with red sleeves)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.46, 0.45, 0);
    this.bodyGroup.add(this.leftArmGroup);

    // Red sleeve
    const sleeveGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.22, 12);
    const leftSleeve = new THREE.Mesh(sleeveGeo, this.shirtMat);
    leftSleeve.position.y = -0.06;
    this.leftArmGroup.add(leftSleeve);

    // Peach arm
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.38, 12);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.y = -0.28;
    this.leftArmGroup.add(leftArm);

    // Cartoon Hand
    const handGeo = new THREE.SphereGeometry(0.11, 10, 10);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.48;
    this.leftArmGroup.add(leftHand);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.46, 0.45, 0);
    this.bodyGroup.add(this.rightArmGroup);

    const rightSleeve = new THREE.Mesh(sleeveGeo, this.shirtMat);
    rightSleeve.position.y = -0.06;
    this.rightArmGroup.add(rightSleeve);

    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.y = -0.28;
    this.rightArmGroup.add(rightArm);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.48;
    this.rightArmGroup.add(rightHand);

    // 4. Legs
    // Left leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.2, -0.25, 0);
    this.bodyGroup.add(this.leftLegGroup);

    const legGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.32, 12);
    const leftLeg = new THREE.Mesh(legGeo, skinMat);
    leftLeg.position.y = -0.12;
    this.leftLegGroup.add(leftLeg);

    // Socks
    const sockGeo = new THREE.CylinderGeometry(0.115, 0.11, 0.14, 12);
    const leftSock = new THREE.Mesh(sockGeo, sockMat);
    leftSock.position.y = -0.26;
    this.leftLegGroup.add(leftSock);

    // Shoe
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.14, 0.32);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.38, 0.05);
    this.leftLegGroup.add(leftShoe);

    const soleGeo = new THREE.BoxGeometry(0.19, 0.04, 0.34);
    const leftSole = new THREE.Mesh(soleGeo, soleMat);
    leftSole.position.set(0, -0.44, 0.05);
    this.leftLegGroup.add(leftSole);

    // Right leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.2, -0.25, 0);
    this.bodyGroup.add(this.rightLegGroup);

    const rightLeg = new THREE.Mesh(legGeo, skinMat);
    rightLeg.position.y = -0.12;
    this.rightLegGroup.add(rightLeg);

    const rightSock = new THREE.Mesh(sockGeo, sockMat);
    rightSock.position.y = -0.26;
    this.rightLegGroup.add(rightSock);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.38, 0.05);
    this.rightLegGroup.add(rightShoe);

    const rightSole = new THREE.Mesh(soleGeo, soleMat);
    rightSole.position.set(0, -0.44, 0.05);
    this.rightLegGroup.add(rightSole);

    // 5. Action Kamen cape (active during superhero power-up)
    this.capeGroup = new THREE.Group();
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const capeGeo = new THREE.PlaneGeometry(0.65, 0.75, 4, 4);
    const capeMesh = new THREE.Mesh(capeGeo, capeMat);
    capeMesh.position.set(0, -0.28, -0.28);
    capeMesh.rotation.x = 0.2;
    this.capeGroup.add(capeMesh);
    this.capeGroup.position.set(0, 0.5, 0);
    this.capeGroup.visible = false;
    this.bodyGroup.add(this.capeGroup);

    // 6. Ground contact shadow (soft radial disc)
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.22)');
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
    this.shadowMesh.position.y = 0.02; // Flush above road
    this.group.add(this.shadowMesh);
  }

  public setPowerupActive(active: boolean) {
    this.capeGroup.visible = active;
  }

  public applySkin(skinId: string) {
    if (skinId.includes('kamen') || skinId.includes('hero')) {
      // Action Kamen Superhero Costume!
      this.shirtMat.color.setHex(0x0284c7); // Kamen blue
      this.shortsMat.color.setHex(0xffffff); // White hero trunks
      this.capeGroup.visible = true; // Hero cape always fluttering
    } else if (skinId.includes('gold')) {
      // Golden Legend Shinchan!
      this.shirtMat.color.setHex(0xf59e0b);
      this.shirtMat.metalness = 0.5;
      this.shirtMat.roughness = 0.2;
      this.shortsMat.color.setHex(0xd97706);
    } else {
      // Classic Iconic Red & Yellow
      this.shirtMat.color.setHex(0xef233c);
      this.shirtMat.metalness = 0.05;
      this.shirtMat.roughness = 0.75;
      this.shortsMat.color.setHex(0xfbbf24);
      this.capeGroup.visible = false;
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
    this.capeGroup.visible = false;
    this.group.rotation.set(0, Math.PI, 0);
    this.bodyGroup.position.set(0, 0.75, 0);
    this.bodyGroup.scale.set(1, 1, 1);
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
      // Comical dizzy spin and wobble
      this.bodyGroup.rotation.y += dt * 8;
      this.bodyGroup.rotation.x = Math.sin(this.hitTimer * 10) * 0.4;
      this.leftArmGroup.rotation.z = -1.2;
      this.rightArmGroup.rotation.z = 1.2;
      this.leftEyebrow.position.y = 0.22 + Math.sin(this.hitTimer * 15) * 0.05;
      this.rightEyebrow.position.y = 0.22 - Math.sin(this.hitTimer * 15) * 0.05;
      return;
    }

    if (state === 'IDLE') {
      // Cheerful Shinchan hip wiggle dance on Title screen!
      this.runCycleTime += dt * 3.5;
      const wiggle = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.75 + Math.abs(Math.sin(this.runCycleTime * 2)) * 0.08;
      this.bodyGroup.rotation.y = wiggle * 0.35;
      this.bodyGroup.rotation.z = wiggle * 0.12;
      this.headGroup.rotation.z = -wiggle * 0.15;
      this.headGroup.rotation.x = 0.05;

      // Arms waving high
      this.leftArmGroup.rotation.z = -1.6 + Math.cos(this.runCycleTime * 2) * 0.3;
      this.rightArmGroup.rotation.z = 1.6 - Math.cos(this.runCycleTime * 2) * 0.3;
      this.leftArmGroup.rotation.x = 0.2;
      this.rightArmGroup.rotation.x = 0.2;

      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;

      this.shadowMesh.scale.set(1, 1, 1);
      return;
    }

    if (state === 'SLIDE') {
      // Belly / low slide forward
      this.bodyGroup.position.y = 0.32;
      this.bodyGroup.rotation.x = 1.2; // Lean forward flat
      this.bodyGroup.rotation.y = 0;
      this.bodyGroup.rotation.z = 0;

      this.headGroup.rotation.x = -0.5; // Look up while sliding
      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftArmGroup.rotation.z = -0.3;
      this.rightArmGroup.rotation.z = 0.3;

      this.leftLegGroup.rotation.x = 1.0;
      this.rightLegGroup.rotation.x = 1.0;

      // Shadow widens and flattens
      this.shadowMesh.scale.set(1.2, 1.4, 1);
      return;
    }

    if (state === 'JUMP') {
      // Superhero Action Kamen jump!
      this.bodyGroup.position.y = 0.75;
      this.bodyGroup.rotation.x = 0.15;
      this.bodyGroup.rotation.y = 0;
      this.bodyGroup.rotation.z = 0;

      this.headGroup.rotation.x = -0.1;
      // Outstretched arms
      this.leftArmGroup.rotation.z = -1.4;
      this.leftArmGroup.rotation.x = -0.4;
      this.rightArmGroup.rotation.z = 1.4;
      this.rightArmGroup.rotation.x = -0.4;

      // Tucked knees
      this.leftLegGroup.rotation.x = 0.85;
      this.rightLegGroup.rotation.x = 0.65;

      // Shadow shrinks as jump height increases
      const shadowScale = Math.max(0.3, 1 - jumpY * 0.3);
      this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
      return;
    }

    // Default: RUNNING
    const runFreq = 14 * speedMultiplier;
    this.runCycleTime += dt * runFreq;
    const legPhase = Math.sin(this.runCycleTime);
    const armPhase = -legPhase;

    // Plump bouncy run motion
    this.bodyGroup.position.y = 0.75 + Math.abs(Math.sin(this.runCycleTime)) * 0.1;
    this.bodyGroup.rotation.x = 0.22; // Energetic forward lean
    this.bodyGroup.rotation.y = Math.sin(this.runCycleTime * 0.5) * 0.1;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.06;

    // Head bobs
    this.headGroup.rotation.x = -0.15 + Math.abs(Math.sin(this.runCycleTime)) * 0.08;
    this.headGroup.rotation.y = -Math.sin(this.runCycleTime * 0.5) * 0.08;

    // Running limbs
    this.leftLegGroup.rotation.x = legPhase * 0.85;
    this.rightLegGroup.rotation.x = -legPhase * 0.85;

    this.leftArmGroup.rotation.x = armPhase * 0.85;
    this.leftArmGroup.rotation.z = -0.25;
    this.rightArmGroup.rotation.x = -armPhase * 0.85;
    this.rightArmGroup.rotation.z = 0.25;

    // Cape flutter
    if (this.capeGroup.visible) {
      const capeMesh = this.capeGroup.children[0] as THREE.Mesh;
      if (capeMesh) {
        capeMesh.rotation.x = 0.4 + Math.sin(this.runCycleTime * 1.5) * 0.25;
      }
    }

    this.shadowMesh.scale.set(1, 1, 1);
  }
}
