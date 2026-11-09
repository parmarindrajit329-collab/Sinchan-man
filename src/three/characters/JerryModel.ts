import * as THREE from 'three';
import { ICharacterModel } from './CharacterTypes';

export class JerryModel implements ICharacterModel {
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

    // Jerry Mouse Palette
    const mouseBrownMat = new THREE.MeshStandardMaterial({
      color: 0x92400e, // Rich warm brown mouse fur
      roughness: 0.65,
    });

    const peachBellyMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      roughness: 0.55,
    });

    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.5,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.3,
    });

    // 1. Compact Pear-shaped Mouse Body
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.55;
    this.group.add(this.bodyGroup);

    const bodyGeo = new THREE.SphereGeometry(0.38, 16, 14);
    bodyGeo.scale(1.0, 1.1, 0.9);
    this.furMesh = new THREE.Mesh(bodyGeo, mouseBrownMat);
    this.furMesh.position.y = 0.2;
    this.furMesh.castShadow = true;
    this.bodyGroup.add(this.furMesh);

    // Peach tummy
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), peachBellyMat);
    belly.scale.set(0.9, 1.1, 0.4);
    belly.position.set(0, 0.18, 0.24);
    this.bodyGroup.add(belly);

    // 2. Cute Mouse Head with Giant Rounded Ears
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0.05);
    this.bodyGroup.add(this.headGroup);

    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    headGeo.scale(1.0, 0.95, 1.1);
    const head = new THREE.Mesh(headGeo, mouseBrownMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 8), mouseBrownMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.04, 0.38);
    this.headGroup.add(snout);

    // Black nose tip
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), noseMat);
    nose.position.set(0, 0.02, 0.52);
    this.headGroup.add(nose);

    // Big Iconic Round Mouse Ears!
    const makeEar = (isLeft: boolean) => {
      const earGroup = new THREE.Group();
      const earOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), mouseBrownMat);
      earOuter.rotation.x = Math.PI / 2;
      earGroup.add(earOuter);

      const earInner = new THREE.Mesh(new THREE.CircleGeometry(0.16, 14), innerEarMat);
      earInner.position.z = 0.025;
      earGroup.add(earInner);

      earGroup.position.set(isLeft ? -0.32 : 0.32, 0.28, -0.05);
      earGroup.rotation.y = isLeft ? 0.3 : -0.3;
      return earGroup;
    };

    this.headGroup.add(makeEar(true));
    this.headGroup.add(makeEar(false));

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
    eyeL.position.set(-0.11, 0.1, 0.34);
    this.headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
    eyeR.position.set(0.11, 0.1, 0.34);
    this.headGroup.add(eyeR);

    // 3. Tiny Agile Arms
    const makeArm = (isLeft: boolean) => {
      const arm = new THREE.Group();
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.3, 10), mouseBrownMat);
      upper.position.y = -0.12;
      arm.add(upper);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), peachBellyMat);
      hand.position.y = -0.3;
      arm.add(hand);

      arm.position.set(isLeft ? -0.34 : 0.34, 0.35, 0);
      return arm;
    };

    this.leftArmGroup = makeArm(true);
    this.bodyGroup.add(this.leftArmGroup);

    this.rightArmGroup = makeArm(false);
    this.bodyGroup.add(this.rightArmGroup);

    // 4. Little Mouse Feet
    const makeLeg = (isLeft: boolean) => {
      const leg = new THREE.Group();
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.25, 10), mouseBrownMat);
      legMesh.position.y = -0.1;
      leg.add(legMesh);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.24), peachBellyMat);
      foot.position.set(0, -0.24, 0.04);
      leg.add(foot);

      leg.position.set(isLeft ? -0.15 : 0.15, -0.1, 0);
      return leg;
    };

    this.leftLegGroup = makeLeg(true);
    this.bodyGroup.add(this.leftLegGroup);

    this.rightLegGroup = makeLeg(false);
    this.bodyGroup.add(this.rightLegGroup);

    // 5. Thin Mouse Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.08, -0.32);
    this.bodyGroup.add(this.tailGroup);

    const tailGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.7, 8);
    tailGeo.rotateX(-Math.PI * 0.4);
    const tailMesh = new THREE.Mesh(tailGeo, innerEarMat);
    tailMesh.position.set(0, 0.15, -0.25);
    this.tailGroup.add(tailMesh);

    // Shadow
    const shadowGeo = new THREE.CircleGeometry(0.42, 20);
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
    if (skinId.includes('cheese')) {
      (this.furMesh.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
    } else {
      (this.furMesh.material as THREE.MeshStandardMaterial).color.setHex(0x92400e);
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
    this.bodyGroup.position.set(0, 0.55, 0);
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
      this.runCycleTime += dt * 3.2;
      const b = Math.sin(this.runCycleTime);
      this.bodyGroup.position.y = 0.55 + Math.abs(b) * 0.04;
      this.tailGroup.rotation.y = Math.sin(this.runCycleTime * 2) * 0.4;
      return;
    }

    if (state === 'SLIDE') {
      this.bodyGroup.position.y = 0.24;
      this.bodyGroup.rotation.x = 1.25;
      this.headGroup.rotation.x = -0.5;
      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftLegGroup.rotation.x = 1.0;
      this.rightLegGroup.rotation.x = 1.0;
      return;
    }

    if (state === 'JUMP') {
      this.bodyGroup.position.y = 0.55;
      this.bodyGroup.rotation.x = 0.2;
      this.leftArmGroup.rotation.z = -1.5;
      this.rightArmGroup.rotation.z = 1.5;
      this.leftLegGroup.rotation.x = 0.6;
      this.rightLegGroup.rotation.x = 0.6;
      return;
    }

    // Default RUN: Rapid nimble mouse scamper!
    const freq = 19 * speedMultiplier;
    this.runCycleTime += dt * freq;
    const legPhase = Math.sin(this.runCycleTime);

    this.bodyGroup.position.y = 0.55 + Math.abs(Math.sin(this.runCycleTime)) * 0.08;
    this.bodyGroup.rotation.x = 0.26;
    this.bodyGroup.rotation.z = Math.sin(this.runCycleTime) * 0.05;

    this.leftLegGroup.rotation.x = legPhase * 0.95;
    this.rightLegGroup.rotation.x = -legPhase * 0.95;

    this.leftArmGroup.rotation.x = -legPhase * 1.0;
    this.rightArmGroup.rotation.x = legPhase * 1.0;

    this.tailGroup.rotation.y = Math.sin(this.runCycleTime * 1.5) * 0.45;
  }
}
