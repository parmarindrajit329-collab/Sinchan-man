import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class DoraemonModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private bellMesh: THREE.Mesh;
  private tailGroup: THREE.Group;
  private blueMat: THREE.MeshStandardMaterial;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Doraemon Iconic Materials
    this.blueMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Sky blue cat robot body
      roughness: 0.45,
      metalness: 0.1,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White belly, face, hands
      roughness: 0.4,
    });

    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red collar, nose, tail
      roughness: 0.5,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Golden bell
      metalness: 0.85,
      roughness: 0.25,
    });

    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
    });

    // 1. Body & Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.65;
    this.group.add(this.bodyGroup);

    // Blue round body
    const bodyGeo = new THREE.SphereGeometry(0.5, 20, 18);
    bodyGeo.scale(1.0, 0.95, 0.9);
    const body = new THREE.Mesh(bodyGeo, this.blueMat);
    body.position.y = 0.2;
    body.castShadow = true;
    this.bodyGroup.add(body);

    // White belly
    const bellyGeo = new THREE.SphereGeometry(0.38, 16, 16);
    bellyGeo.scale(1.0, 0.9, 0.5);
    const belly = new THREE.Mesh(bellyGeo, whiteMat);
    belly.position.set(0, 0.16, 0.3);
    this.bodyGroup.add(belly);

    // 4D Dimensional Pocket!
    const pocketGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16, 1, false, 0, Math.PI);
    pocketGeo.rotateX(Math.PI / 2);
    const pocket = new THREE.Mesh(pocketGeo, whiteMat);
    pocket.position.set(0, 0.12, 0.48);
    this.bodyGroup.add(pocket);

    // Red Collar
    const collarGeo = new THREE.TorusGeometry(0.44, 0.065, 8, 24);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, redMat);
    collar.position.y = 0.6;
    this.bodyGroup.add(collar);

    // Golden Bell
    const bellGeo = new THREE.SphereGeometry(0.1, 14, 14);
    this.bellMesh = new THREE.Mesh(bellGeo, goldMat);
    this.bellMesh.position.set(0, 0.54, 0.46);
    this.bodyGroup.add(this.bellMesh);

    // Red Ball Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.15, -0.45);
    const tailMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), redMat);
    this.tailGroup.add(tailMesh);
    this.bodyGroup.add(this.tailGroup);

    // 2. Big Round Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.95, 0.05);
    this.bodyGroup.add(this.headGroup);

    // Blue spherical skull
    const headGeo = new THREE.SphereGeometry(0.56, 22, 20);
    const head = new THREE.Mesh(headGeo, this.blueMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // White round face plate
    const faceGeo = new THREE.SphereGeometry(0.48, 18, 18);
    faceGeo.scale(1.0, 0.92, 0.5);
    const face = new THREE.Mesh(faceGeo, whiteMat);
    face.position.set(0, -0.06, 0.24);
    this.headGroup.add(face);

    // Red round nose
    const noseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nose = new THREE.Mesh(noseGeo, redMat);
    nose.position.set(0, 0.05, 0.54);
    this.headGroup.add(nose);

    // Cartoon Eyes (together in middle)
    const eyeGeo = new THREE.SphereGeometry(0.12, 14, 14);
    eyeGeo.scale(0.85, 1.25, 0.4);

    const eyeL = new THREE.Mesh(eyeGeo, whiteMat);
    eyeL.position.set(-0.11, 0.24, 0.48);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, whiteMat);
    eyeR.position.set(0.11, 0.24, 0.48);
    this.headGroup.add(eyeR);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const pupilL = new THREE.Mesh(pupilGeo, blackMat);
    pupilL.position.set(-0.08, 0.22, 0.53);
    this.headGroup.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, blackMat);
    pupilR.position.set(0.08, 0.22, 0.53);
    this.headGroup.add(pupilR);

    // Whiskers (3 on left, 3 on right)
    const whiskerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.26, 6);
    whiskerGeo.rotateZ(Math.PI / 2);

    [-0.02, 0.05, 0.12].forEach((offsetY, idx) => {
      const wL = new THREE.Mesh(whiskerGeo, blackMat);
      wL.position.set(-0.28, offsetY - 0.05, 0.46);
      wL.rotation.z = (idx - 1) * 0.15;
      this.headGroup.add(wL);

      const wR = new THREE.Mesh(whiskerGeo, blackMat);
      wR.position.set(0.28, offsetY - 0.05, 0.46);
      wR.rotation.z = -(idx - 1) * 0.15;
      this.headGroup.add(wR);
    });

    // 3. Arms with Round Ball Hands
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.32, 12), this.blueMat);
      upperArm.position.y = -0.15;
      arm.add(upperArm);

      // White ball hand!
      const ballHand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), whiteMat);
      ballHand.position.y = -0.36;
      arm.add(ballHand);

      arm.position.set(isLeft ? -0.52 : 0.52, 0.35, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Round White Feet
    const makeFoot = (isLeft: boolean) => {
      const footGroup = new THREE.Group();
      const footMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.42), whiteMat);
      footMesh.position.set(0, -0.15, 0.06);
      footGroup.add(footMesh);
      footGroup.position.set(isLeft ? -0.22 : 0.22, -0.12, 0);
      return footGroup;
    };

    this.leftLegGroup = makeFoot(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeFoot(false);
    this.bodyGroup.add(this.rightLegGroup);

    // 5. Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.6, 24);
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
    // Glowing bell
    (this.bellMesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(active ? 0xfacc15 : 0x000000);
    (this.bellMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = active ? 0.8 : 0;
  }

  public applySkin(skinId: string) {
    if (skinId.includes('yellow') || skinId.includes('classic_yellow')) {
      // Original 2112 Factory Yellow Doraemon!
      this.blueMat.color.setHex(0xfacc15);
      this.blueMat.metalness = 0.1;
      this.blueMat.roughness = 0.45;
    } else if (skinId.includes('gold') || skinId.includes('cyber')) {
      // 22nd Century Cyber Gold
      this.blueMat.color.setHex(0xf59e0b);
      this.blueMat.metalness = 0.6;
      this.blueMat.roughness = 0.25;
    } else {
      // Classic Sky Blue Cat Robot
      this.blueMat.color.setHex(0x0284c7);
      this.blueMat.metalness = 0.1;
      this.blueMat.roughness = 0.45;
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
      this.bodyGroup.position.y = 0.65 + Math.abs(b) * 0.08;
      this.leftArmGroup.rotation.z = -1.5 + b * 0.3;
      this.rightArmGroup.rotation.z = 1.5 - b * 0.3;
      this.tailGroup.rotation.y = b * 0.5;
      return;
    }

    if (state === 'SLIDE') {
      this.bodyGroup.position.y = 0.28;
      this.bodyGroup.rotation.x = 1.2;
      this.headGroup.rotation.x = -0.5;
      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftLegGroup.rotation.x = 1.0;
      this.rightLegGroup.rotation.x = 1.0;
      return;
    }

    if (state === 'JUMP') {
      this.bodyGroup.position.y = 0.65;
      this.bodyGroup.rotation.x = 0.15;
      this.headGroup.rotation.x = -0.15;
      this.leftArmGroup.rotation.z = -1.6;
      this.rightArmGroup.rotation.z = 1.6;
      this.leftLegGroup.rotation.x = 0.4;
      this.rightLegGroup.rotation.x = 0.4;
      return;
    }

    // Default RUN: Cute waddling sprint
    const freq = 14 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.65 + Math.abs(Math.sin(this.runCycleTime)) * 0.08;
    this.bodyGroup.rotation.x = 0.18;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.08;

    this.leftLegGroup.rotation.x = legPhase * 0.75;
    this.rightLegGroup.rotation.x = -legPhase * 0.75;

    this.leftArmGroup.rotation.x = -legPhase * 0.8;
    this.rightArmGroup.rotation.x = legPhase * 0.8;

    this.tailGroup.rotation.y = Math.sin(this.runCycleTime * 2) * 0.4;
  }
}
