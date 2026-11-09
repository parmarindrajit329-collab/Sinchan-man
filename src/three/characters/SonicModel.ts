import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class SonicModel implements ICharacterModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private spineMesh: THREE.Group;
  private furMesh: THREE.Mesh;

  private runCycleTime: number = 0;
  private isHit: boolean = false;
  private hitTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Sonic Palette
    const sonicBlueMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Cobalt electric blue
      roughness: 0.45,
      metalness: 0.1,
    });

    const peachMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      roughness: 0.5,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
    });

    const sneakerRedMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Bright red sneakers
      roughness: 0.4,
      metalness: 0.1,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.8,
      roughness: 0.2,
    });

    // 1. Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.75;
    this.group.add(this.bodyGroup);

    this.furMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), sonicBlueMat);
    this.furMesh.castShadow = true;
    this.bodyGroup.add(this.furMesh);

    // Peach chest patch
    const chestPatch = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), peachMat);
    chestPatch.scale.set(0.9, 1.1, 0.4);
    chestPatch.position.set(0, 0, 0.24);
    this.bodyGroup.add(chestPatch);

    // 2. Head with 3 Big Iconic Blue Quills
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0.05);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 16), sonicBlueMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // 3 Spiky Quills curving backwards
    this.spineMesh = new THREE.Group();
    const quillGeo = new THREE.ConeGeometry(0.2, 0.75, 6);
    quillGeo.rotateX(-Math.PI * 0.4);

    const q1 = new THREE.Mesh(quillGeo, sonicBlueMat);
    q1.position.set(0, 0.25, -0.35);
    this.spineMesh.add(q1);

    const q2 = new THREE.Mesh(quillGeo, sonicBlueMat);
    q2.position.set(0, -0.05, -0.42);
    q2.rotation.x = -0.2;
    this.spineMesh.add(q2);

    const q3 = new THREE.Mesh(quillGeo, sonicBlueMat);
    q3.position.set(0, -0.3, -0.38);
    q3.rotation.x = -0.35;
    this.spineMesh.add(q3);

    this.headGroup.add(this.spineMesh);

    // Peach Muzzle
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 12), peachMat);
    muzzle.scale.set(1.1, 0.8, 1.1);
    muzzle.position.set(0, -0.1, 0.3);
    this.headGroup.add(muzzle);

    // Black nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x09090b }));
    nose.position.set(0, -0.02, 0.52);
    this.headGroup.add(nose);

    // Pointed Blue Ears with Peach Interior
    const earGeo = new THREE.ConeGeometry(0.12, 0.32, 4);
    const earL = new THREE.Mesh(earGeo, sonicBlueMat);
    earL.position.set(-0.25, 0.38, 0.05);
    earL.rotation.z = 0.25;
    this.headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, sonicBlueMat);
    earR.position.set(0.25, 0.38, 0.05);
    earR.rotation.z = -0.25;
    this.headGroup.add(earR);

    // Big green cartoon eyes
    const eyeGeo = new THREE.SphereGeometry(0.14, 14, 14);
    eyeGeo.scale(0.8, 1.25, 0.3);
    const eyeL = new THREE.Mesh(eyeGeo, whiteMat);
    eyeL.position.set(-0.11, 0.12, 0.36);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, whiteMat);
    eyeR.position.set(0.11, 0.12, 0.36);
    this.headGroup.add(eyeR);

    const irisMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), irisMat);
    irisL.position.set(-0.08, 0.12, 0.43);
    this.headGroup.add(irisL);

    const irisR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), irisMat);
    irisR.position.set(0.08, 0.12, 0.43);
    this.headGroup.add(irisR);

    // 3. Slender Peach Arms & White Gloves
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.38, 10), peachMat);
      upper.position.y = -0.18;
      arm.add(upper);

      // White glove cuff
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 6, 16), whiteMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.36;
      arm.add(cuff);

      const glove = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), whiteMat);
      glove.position.y = -0.46;
      arm.add(glove);

      arm.position.set(isLeft ? -0.38 : 0.38, 0.32, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Slender Blue Legs & Iconic Red Power Sneakers
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.38, 10), sonicBlueMat);
      legMesh.position.y = -0.18;
      leg.add(legMesh);

      // White Sock cuff
      const sock = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.04, 6, 16), whiteMat);
      sock.rotation.x = Math.PI / 2;
      sock.position.y = -0.36;
      leg.add(sock);

      // Red Sneaker with white strap & gold buckle
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.36), sneakerRedMat);
      shoe.position.set(0, -0.46, 0.08);
      leg.add(shoe);

      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.05, 0.08), whiteMat);
      strap.position.set(0, -0.42, 0.08);
      leg.add(strap);

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.09), goldMat);
      buckle.position.set(isLeft ? -0.1 : 0.1, -0.42, 0.08);
      leg.add(buckle);

      leg.position.set(isLeft ? -0.16 : 0.16, -0.25, 0);
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

  public setPowerupActive(active: boolean) {}

  public applySkin(skinId: string) {
    if (skinId.includes('super')) {
      // Super Sonic Golden Skin!
      (this.furMesh.material as THREE.MeshStandardMaterial).color.setHex(0xfacc15);
      (this.furMesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xfbbf24);
      (this.furMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
    } else {
      (this.furMesh.material as THREE.MeshStandardMaterial).color.setHex(0x2563eb);
      (this.furMesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x000000);
      (this.furMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
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
      this.bodyGroup.position.y = 0.75 + Math.abs(b) * 0.04;
      // Classic finger wag pose
      this.rightArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.z = -0.3 + b * 0.2;
      return;
    }

    if (state === 'SLIDE') {
      // Supersonic spin dash roll!
      this.bodyGroup.position.y = 0.3;
      this.bodyGroup.rotation.x += dt * 25; // Rapid spin roll!
      return;
    }

    if (state === 'JUMP') {
      this.bodyGroup.position.y = 0.75;
      this.bodyGroup.rotation.x += dt * 18; // Spin ball leap!
      return;
    }

    // Default RUN: Supersonic dynamic forward lean sprint
    const freq = 18 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.75 + Math.abs(Math.sin(this.runCycleTime)) * 0.1;
    this.bodyGroup.rotation.x = 0.35; // Aerodynamic supersonic lean
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.03;

    // Windmill legs
    this.leftLegGroup.rotation.x = legPhase * 1.1;
    this.rightLegGroup.rotation.x = -legPhase * 1.1;

    // Arms streaming back
    this.leftArmGroup.rotation.x = 1.1;
    this.rightArmGroup.rotation.x = 1.1;
  }
}
