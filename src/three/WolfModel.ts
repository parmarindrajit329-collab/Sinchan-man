import * as THREE from 'three';

export class WolfModel {
  public group: THREE.Group;
  public shadowMesh: THREE.Mesh;

  // Subparts for galloping animation
  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private jawMesh: THREE.Mesh;
  private frontLeftLeg: THREE.Group;
  private frontRightLeg: THREE.Group;
  private backLeftLeg: THREE.Group;
  private backRightLeg: THREE.Group;
  private tailGroup: THREE.Group;

  // Eyes (glowing menacingly)
  private leftEye: THREE.Mesh;
  private rightEye: THREE.Mesh;

  // Gallop state
  private gallopPhase: number = 0;
  private isPouncing: boolean = false;
  private pounceTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Wolf Fur & Feature Materials
    const darkFurMat = new THREE.MeshStandardMaterial({
      color: 0x27272a, // Dark charcoal slate
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const lightFurMat = new THREE.MeshStandardMaterial({
      color: 0x52525b, // Muzzle & chest underfur
      roughness: 0.9,
      flatShading: true,
    });

    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xf87171, // Pinkish ear interior
      roughness: 0.6,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.3,
    });

    const fangMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
    });

    const eyeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xff2222,
      emissive: 0xff0000,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });

    // 1. Body / Torso
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.85;
    this.group.add(this.bodyGroup);

    // Deep chest
    const chestGeo = new THREE.BoxGeometry(0.75, 0.75, 1.1);
    const chest = new THREE.Mesh(chestGeo, darkFurMat);
    chest.position.set(0, 0.1, 0.3);
    chest.castShadow = true;
    this.bodyGroup.add(chest);

    // Fluffy chest underfur
    const underfurGeo = new THREE.ConeGeometry(0.35, 0.6, 4);
    underfurGeo.rotateX(Math.PI / 2);
    const underfur = new THREE.Mesh(underfurGeo, lightFurMat);
    underfur.position.set(0, -0.15, 0.65);
    this.bodyGroup.add(underfur);

    // Lean abdomen & hips
    const hipGeo = new THREE.BoxGeometry(0.65, 0.6, 0.9);
    const hips = new THREE.Mesh(hipGeo, darkFurMat);
    hips.position.set(0, 0.05, -0.6);
    hips.castShadow = true;
    this.bodyGroup.add(hips);

    // 2. Head & Jaws
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.35, 0.9);
    this.bodyGroup.add(this.headGroup);

    // Skull
    const skullGeo = new THREE.BoxGeometry(0.55, 0.5, 0.65);
    const skull = new THREE.Mesh(skullGeo, darkFurMat);
    skull.castShadow = true;
    this.headGroup.add(skull);

    // Upper Snout
    const snoutGeo = new THREE.BoxGeometry(0.36, 0.26, 0.55);
    const snout = new THREE.Mesh(snoutGeo, lightFurMat);
    snout.position.set(0, -0.06, 0.5);
    this.headGroup.add(snout);

    // Black Nose
    const noseGeo = new THREE.BoxGeometry(0.16, 0.12, 0.12);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.04, 0.78);
    this.headGroup.add(nose);

    // Pointed Ears
    const earGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    earGeo.rotateY(Math.PI / 4);

    const leftEar = new THREE.Mesh(earGeo, darkFurMat);
    leftEar.position.set(-0.25, 0.38, -0.08);
    leftEar.rotation.z = 0.2;
    leftEar.rotation.x = -0.15;
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, darkFurMat);
    rightEar.position.set(0.25, 0.38, -0.08);
    rightEar.rotation.z = -0.2;
    rightEar.rotation.x = -0.15;
    this.headGroup.add(rightEar);

    // Inner pink ear accents
    const innerEarGeo = new THREE.PlaneGeometry(0.12, 0.26);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    leftInnerEar.position.set(-0.24, 0.38, 0.03);
    this.headGroup.add(leftInnerEar);

    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMat);
    rightInnerEar.position.set(0.24, 0.38, 0.03);
    this.headGroup.add(rightInnerEar);

    // Piercing Glowing Red/Amber Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    eyeGeo.scale(1.2, 0.6, 0.6);

    this.leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    this.leftEye.position.set(-0.2, 0.12, 0.36);
    this.leftEye.rotation.y = -0.2;
    this.headGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    this.rightEye.position.set(0.2, 0.12, 0.36);
    this.rightEye.rotation.y = 0.2;
    this.headGroup.add(this.rightEye);

    // Snapping Lower Jaw & Fangs
    this.jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.5), lightFurMat);
    this.jawMesh.position.set(0, -0.2, 0.48);
    this.headGroup.add(this.jawMesh);

    // Sharp Fangs
    const fangGeo = new THREE.ConeGeometry(0.05, 0.16, 4);
    const fangL = new THREE.Mesh(fangGeo, fangMat);
    fangL.rotation.x = Math.PI;
    fangL.position.set(-0.12, -0.15, 0.68);
    this.headGroup.add(fangL);

    const fangR = new THREE.Mesh(fangGeo, fangMat);
    fangR.rotation.x = Math.PI;
    fangR.position.set(0.12, -0.15, 0.68);
    this.headGroup.add(fangR);

    // 3. Four Running Legs
    const makeLeg = () => {
      const legGroup = new THREE.Group();
      // Upper thigh
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.28), darkFurMat);
      thigh.position.y = -0.22;
      thigh.castShadow = true;
      legGroup.add(thigh);

      // Lower paw
      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.2), darkFurMat);
      shin.position.y = -0.55;
      shin.position.z = 0.05;
      shin.castShadow = true;
      legGroup.add(shin);

      // Foot paw
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), lightFurMat);
      foot.position.y = -0.74;
      foot.position.z = 0.12;
      legGroup.add(foot);

      return legGroup;
    };

    // Front Left
    this.frontLeftLeg = makeLeg();
    this.frontLeftLeg.position.set(-0.35, -0.1, 0.6);
    this.bodyGroup.add(this.frontLeftLeg);

    // Front Right
    this.frontRightLeg = makeLeg();
    this.frontRightLeg.position.set(0.35, -0.1, 0.6);
    this.bodyGroup.add(this.frontRightLeg);

    // Back Left
    this.backLeftLeg = makeLeg();
    this.backLeftLeg.position.set(-0.32, -0.1, -0.75);
    this.bodyGroup.add(this.backLeftLeg);

    // Back Right
    this.backRightLeg = makeLeg();
    this.backRightLeg.position.set(0.32, -0.1, -0.75);
    this.bodyGroup.add(this.backRightLeg);

    // 4. Bushy Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.2, -1.0);
    this.bodyGroup.add(this.tailGroup);

    const tailGeo = new THREE.ConeGeometry(0.22, 0.9, 6);
    tailGeo.rotateX(-Math.PI * 0.7);
    const tailMesh = new THREE.Mesh(tailGeo, darkFurMat);
    tailMesh.position.set(0, -0.2, -0.35);
    this.tailGroup.add(tailMesh);

    // 5. Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.9, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
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

  public triggerPounce() {
    this.isPouncing = true;
    this.pounceTimer = 0;
  }

  public reset() {
    this.isPouncing = false;
    this.pounceTimer = 0;
    this.gallopPhase = 0;
    this.group.rotation.set(0, Math.PI, 0);
    this.bodyGroup.position.set(0, 0.85, 0);
    this.bodyGroup.rotation.set(0, 0, 0);
  }

  public updateAnimation(dt: number, speedMultiplier: number, proximityDistance: number) {
    if (this.isPouncing) {
      this.pounceTimer += dt;
      // Dramatic lunge onto player forward
      this.bodyGroup.position.y = 0.85 + Math.sin(Math.min(this.pounceTimer * 3, Math.PI / 2)) * 0.6;
      this.bodyGroup.rotation.x = 0.4;
      this.jawMesh.rotation.x = 0.5; // Jaws wide open!
      this.frontLeftLeg.rotation.x = 1.1; // Claws reaching forward
      this.frontRightLeg.rotation.x = 1.1;
      return;
    }

    // Predatory gallop cycle
    const freq = 18 * Math.max(0.8, speedMultiplier);
    this.gallopPhase += dt * freq;

    // Spine flex & bound
    const bound = Math.sin(this.gallopPhase);
    this.bodyGroup.position.y = 0.85 + Math.abs(bound) * 0.22;
    this.bodyGroup.rotation.x = bound * 0.12;

    // Galloping legs: forelegs stretch forward while hindlegs push
    this.frontLeftLeg.rotation.x = Math.sin(this.gallopPhase) * 1.1;
    this.frontRightLeg.rotation.x = Math.sin(this.gallopPhase + 0.3) * 1.05;
    this.backLeftLeg.rotation.x = -Math.sin(this.gallopPhase) * 1.15;
    this.backRightLeg.rotation.x = -Math.sin(this.gallopPhase + 0.3) * 1.1;

    // Head bob & snapping jaws
    this.headGroup.rotation.x = -bound * 0.15;
    // Jaws snap aggressively when close to player!
    const snapSpeed = proximityDistance < 3.5 ? 2.5 : 1.0;
    this.jawMesh.rotation.x = Math.max(0, Math.sin(this.gallopPhase * snapSpeed) * 0.45);

    // Tail flutters in the wind
    this.tailGroup.rotation.x = Math.sin(this.gallopPhase) * 0.25;
    this.tailGroup.rotation.y = Math.cos(this.gallopPhase * 0.5) * 0.35;

    // Eyes pulse menacingly
    const eyeIntensity = 0.8 + Math.sin(this.gallopPhase * 2) * 0.25;
    (this.leftEye.material as THREE.MeshStandardMaterial).emissiveIntensity = eyeIntensity;
    (this.rightEye.material as THREE.MeshStandardMaterial).emissiveIntensity = eyeIntensity;
  }
}
