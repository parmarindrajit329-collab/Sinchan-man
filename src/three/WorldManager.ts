import * as THREE from 'three';
import { Obstacle, ObstacleType, Coin, Lane, PowerUpItem, PowerUpType, CharacterId } from '../types/game';

export const LANE_WIDTH = 2.3;
export const LANE_POSITIONS: Record<Lane, number> = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH,
};

const CHUNK_LENGTH = 44;
const TOTAL_CHUNKS = 8;

export class WorldManager {
  public scene: THREE.Scene;
  public obstacles: Obstacle[] = [];
  public coins: Coin[] = [];
  public powerUps: PowerUpItem[] = [];
  public chunks: THREE.Group[] = [];

  private nextObstacleId = 1;
  private nextCoinId = 1;
  private nextPowerUpId = 1;

  // Materials for realistic cartoon city & road striping
  private roadMat: THREE.MeshStandardMaterial;
  private roadEdgeStripeMat: THREE.MeshStandardMaterial;
  private laneLineMat: THREE.MeshStandardMaterial;
  private zebraStripeMat: THREE.MeshStandardMaterial;
  private sidewalkMat: THREE.MeshStandardMaterial;
  private curbMat: THREE.MeshStandardMaterial;
  private grassMat: THREE.MeshStandardMaterial;
  private studMat: THREE.MeshStandardMaterial;

  // Powerup materials
  private magnetMat: THREE.MeshStandardMaterial;
  private shieldMat: THREE.MeshStandardMaterial;
  private multMat: THREE.MeshStandardMaterial;

  // Active character
  public activeCharacter: CharacterId = 'shinchan';

  private furthestZ: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Realistic Asphalt & High-Vis Striping
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e2433, // Realistic dark asphalt
      roughness: 0.85,
      metalness: 0.1,
    });

    this.roadEdgeStripeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Solid bright white shoulder line
      roughness: 0.4,
    });

    this.laneLineMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Yellow dashed highway lane divider
      roughness: 0.35,
    });

    this.zebraStripeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Pedestrian zebra crossing
      roughness: 0.3,
    });

    this.sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.8,
    });

    this.curbMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red & white safety curb
      roughness: 0.6,
    });

    this.grassMat = new THREE.MeshStandardMaterial({
      color: 0x3fb950, // Lush anime lawn
      roughness: 0.9,
    });

    this.studMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Power-up materials
    this.magnetMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.2,
    });

    this.shieldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x34d399,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
    });

    this.multMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });

    this.spawnSkyClouds();
    this.initWorld();
  }

  public setCharacter(charId: CharacterId) {
    this.activeCharacter = charId;
  }

  private spawnSkyClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });

    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 30; i++) {
      const singleCloud = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puffGeo = new THREE.DodecahedronGeometry(2.8 + Math.random() * 2.5, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (p - numPuffs / 2) * 2.4,
          Math.sin(p) * 0.8,
          (Math.random() - 0.5) * 2.5
        );
        singleCloud.add(puff);
      }
      singleCloud.position.set(
        (Math.random() - 0.5) * 140,
        24 + Math.random() * 15,
        -Math.random() * 340
      );
      cloudGroup.add(singleCloud);
    }
    this.scene.add(cloudGroup);
  }

  private createHouse(isLeft: boolean): THREE.Group {
    const house = new THREE.Group();
    const colors = [0xfef3c7, 0xe0f2fe, 0xffedd5, 0xdcfce7, 0xfce7f3];
    const roofColors = [0x1e3a8a, 0x991b1b, 0x065f46, 0x374151, 0x78350f];

    const wallColor = colors[Math.floor(Math.random() * colors.length)];
    const roofColor = roofColors[Math.floor(Math.random() * roofColors.length)];

    const houseWidth = 5.2 + Math.random() * 2;
    const houseHeight = 4.8 + Math.random() * 2;
    const houseDepth = 6.2 + Math.random() * 2;

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.6, metalness: 0.1 });

    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth), wallMat);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallMesh.position.y = houseHeight / 2;
    house.add(wallMesh);

    const roofGeo = new THREE.ConeGeometry(houseWidth * 0.85, 2.4, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.castShadow = true;
    roofMesh.position.y = houseHeight + 1.2;
    house.add(roofMesh);

    return house;
  }

  private createTree(isCherryBlossom: boolean): THREE.Group {
    const tree = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.2, 8), trunkMat);
    trunk.castShadow = true;
    trunk.position.y = 1.6;
    tree.add(trunk);

    const leafColor = isCherryBlossom
      ? (Math.random() > 0.5 ? 0xf472b6 : 0xfbcfe8)
      : (Math.random() > 0.5 ? 0x22c55e : 0x16a34a);

    const foliageMat = new THREE.MeshStandardMaterial({
      color: leafColor,
      roughness: 0.75,
      flatShading: true,
    });

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), foliageMat);
    foliage.castShadow = true;
    foliage.position.y = 3.6;
    tree.add(foliage);

    return tree;
  }

  private createStreetLamp(): THREE.Group {
    const lamp = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.9 });

    // Vertical pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 8), metalMat);
    pole.position.y = 2.25;
    lamp.add(pole);

    // Overhead curved arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), metalMat);
    arm.position.set(0, 4.4, 0.5);
    lamp.add(arm);

    // Glowing lantern head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.4), metalMat);
    head.position.set(0, 4.35, 1.0);
    lamp.add(head);

    const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.34), bulbMat);
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(0, 4.25, 1.0);
    lamp.add(bulb);

    return lamp;
  }

  private createChunk(chunkZ: number, isFirstChunk: boolean): THREE.Group {
    const chunk = new THREE.Group();
    chunk.position.z = chunkZ;

    const roadWidth = 8.8;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, CHUNK_LENGTH), this.roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    chunk.add(road);

    // 1. Continuous White Road Edge Stripes (Realistic Shoulder lines)
    const edgeStripeL = new THREE.Mesh(new THREE.PlaneGeometry(0.18, CHUNK_LENGTH), this.roadEdgeStripeMat);
    edgeStripeL.rotation.x = -Math.PI / 2;
    edgeStripeL.position.set(-roadWidth / 2 + 0.18, 0.012, 0);
    chunk.add(edgeStripeL);

    const edgeStripeR = new THREE.Mesh(new THREE.PlaneGeometry(0.18, CHUNK_LENGTH), this.roadEdgeStripeMat);
    edgeStripeR.rotation.x = -Math.PI / 2;
    edgeStripeR.position.set(roadWidth / 2 - 0.18, 0.012, 0);
    chunk.add(edgeStripeR);

    // 2. High-Visibility Dashed Highway Dividers & Reflective Cat's Eyes
    const dashLength = 3.2;
    const dashGap = 2.4;
    const lineGeo = new THREE.PlaneGeometry(0.18, dashLength);
    const studGeo = new THREE.BoxGeometry(0.08, 0.03, 0.08);

    for (let z = -CHUNK_LENGTH / 2 + 2; z < CHUNK_LENGTH / 2; z += dashLength + dashGap) {
      // Left divider
      const lineL = new THREE.Mesh(lineGeo, this.laneLineMat);
      lineL.rotation.x = -Math.PI / 2;
      lineL.position.set(-LANE_WIDTH / 2, 0.015, z);
      chunk.add(lineL);

      const studL = new THREE.Mesh(studGeo, this.studMat);
      studL.position.set(-LANE_WIDTH / 2, 0.02, z + dashLength / 2);
      chunk.add(studL);

      // Right divider
      const lineR = new THREE.Mesh(lineGeo, this.laneLineMat);
      lineR.rotation.x = -Math.PI / 2;
      lineR.position.set(LANE_WIDTH / 2, 0.015, z);
      chunk.add(lineR);

      const studR = new THREE.Mesh(studGeo, this.studMat);
      studR.position.set(LANE_WIDTH / 2, 0.02, z + dashLength / 2);
      chunk.add(studR);
    }

    // 3. Realistic Zebra Crossing on select chunks!
    if (!isFirstChunk && Math.random() > 0.6) {
      const zebraZ = -CHUNK_LENGTH * 0.15;
      const numStripes = 8;
      const stripeWidth = 0.55;
      const stripeLength = 4.0;
      for (let s = 0; s < numStripes; s++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(stripeWidth, stripeLength), this.zebraStripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(-roadWidth / 2 + 1.0 + s * 1.0, 0.014, zebraZ);
        chunk.add(stripe);
      }
    }

    // 4. Sidewalks & Curbs
    const sidewalkWidth = 4.8;
    const sidewalkGeo = new THREE.BoxGeometry(sidewalkWidth, 0.22, CHUNK_LENGTH);

    const leftSidewalk = new THREE.Mesh(sidewalkGeo, this.sidewalkMat);
    leftSidewalk.position.set(-roadWidth / 2 - sidewalkWidth / 2, 0.11, 0);
    leftSidewalk.receiveShadow = true;
    chunk.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(sidewalkGeo, this.sidewalkMat);
    rightSidewalk.position.set(roadWidth / 2 + sidewalkWidth / 2, 0.11, 0);
    rightSidewalk.receiveShadow = true;
    chunk.add(rightSidewalk);

    // Red/White curb edges
    const curbGeo = new THREE.BoxGeometry(0.24, 0.26, CHUNK_LENGTH);
    const leftCurb = new THREE.Mesh(curbGeo, this.curbMat);
    leftCurb.position.set(-roadWidth / 2 - 0.12, 0.13, 0);
    chunk.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, this.curbMat);
    rightCurb.position.set(roadWidth / 2 + 0.12, 0.13, 0);
    chunk.add(rightCurb);

    // 5. Lawns & Buildings
    const lawnWidth = 35;
    const lawnGeo = new THREE.PlaneGeometry(lawnWidth, CHUNK_LENGTH);

    const leftLawn = new THREE.Mesh(lawnGeo, this.grassMat);
    leftLawn.rotation.x = -Math.PI / 2;
    leftLawn.position.set(-roadWidth / 2 - sidewalkWidth - lawnWidth / 2, 0.05, 0);
    chunk.add(leftLawn);

    const rightLawn = new THREE.Mesh(lawnGeo, this.grassMat);
    rightLawn.rotation.x = -Math.PI / 2;
    rightLawn.position.set(roadWidth / 2 + sidewalkWidth + lawnWidth / 2, 0.05, 0);
    chunk.add(rightLawn);

    // Street Lamps
    const lampL = this.createStreetLamp();
    lampL.position.set(-roadWidth / 2 - 0.4, 0.22, -CHUNK_LENGTH * 0.25);
    chunk.add(lampL);

    const lampR = this.createStreetLamp();
    lampR.position.set(roadWidth / 2 + 0.4, 0.22, CHUNK_LENGTH * 0.25);
    lampR.rotation.y = Math.PI;
    chunk.add(lampR);

    // Houses & Trees
    if (Math.random() > 0.3) {
      const houseL = this.createHouse(true);
      houseL.position.set(-roadWidth / 2 - sidewalkWidth - 4.5, 0, -CHUNK_LENGTH * 0.25);
      chunk.add(houseL);
    }
    const treeL = this.createTree(Math.random() > 0.4);
    treeL.position.set(-roadWidth / 2 - 1.8, 0.22, CHUNK_LENGTH * 0.25);
    chunk.add(treeL);

    if (Math.random() > 0.3) {
      const houseR = this.createHouse(false);
      houseR.position.set(roadWidth / 2 + sidewalkWidth + 4.5, 0, CHUNK_LENGTH * 0.25);
      chunk.add(houseR);
    }
    const treeR = this.createTree(Math.random() > 0.4);
    treeR.position.set(roadWidth / 2 + 1.8, 0.22, -CHUNK_LENGTH * 0.25);
    chunk.add(treeR);

    return chunk;
  }

  // --- Obstacle Meshes ---

  private buildObstacleMesh(type: ObstacleType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'MOVING_TRAIN') {
      // Red & White Japanese Commuter Tram Car
      const trainMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.4 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
      const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 });

      // Train car body
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 6.5), trainMat);
      body.position.y = 1.4;
      body.castShadow = true;
      group.add(body);

      // White stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.4, 6.52), whiteMat);
      stripe.position.y = 1.35;
      group.add(stripe);

      // Windows
      const winFront = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), glassMat);
      winFront.position.set(0, 1.7, 3.26);
      group.add(winFront);

      // Headlights
      const headL = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), lightMat);
      headL.position.set(-0.65, 0.85, 3.27);
      group.add(headL);

      const headR = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), lightMat);
      headR.position.set(0.65, 0.85, 3.27);
      group.add(headR);
    } else if (type === 'DELIVERY_VAN') {
      const vanMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.2 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 3.4), vanMat);
      body.position.y = 1.15;
      body.castShadow = true;
      group.add(body);

      const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.7), glassMat);
      windshield.position.set(0, 1.5, 1.71);
      group.add(windshield);

      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      [-1.0, 1.0].forEach((z) => {
        const wL = new THREE.Mesh(wheelGeo, tireMat);
        wL.position.set(-0.95, 0.35, z);
        group.add(wL);
        const wR = new THREE.Mesh(wheelGeo, tireMat);
        wR.position.set(0.95, 0.35, z);
        group.add(wR);
      });
    } else if (type === 'LOW_HURDLE') {
      const barMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
      const legMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6 });

      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 0.12), barMat);
      bar.position.y = 0.55;
      bar.castShadow = true;
      group.add(bar);

      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.36, 0.14), whiteMat);
      s1.position.set(-0.45, 0.55, 0);
      group.add(s1);

      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.36, 0.14), whiteMat);
      s2.position.set(0.45, 0.55, 0);
      group.add(s2);

      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-0.85, 0.4, 0);
      group.add(legL);

      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(0.85, 0.4, 0);
      group.add(legR);
    } else if (type === 'GARDEN_BENCH') {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 });

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.6), woodMat);
      seat.position.y = 0.45;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.08), woodMat);
      back.position.set(0, 0.72, -0.26);
      group.add(back);

      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.55), metalMat);
      legL.position.set(-0.75, 0.225, 0);
      group.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.55), metalMat);
      legR.position.set(0.75, 0.225, 0);
      group.add(legR);
    } else if (type === 'HIGH_SIGN') {
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
      const signMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
      const decalMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

      const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.7, 8), metalMat);
      poleL.position.set(-1.05, 1.35, 0);
      group.add(poleL);

      const poleR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.7, 8), metalMat);
      poleR.position.set(1.05, 1.35, 0);
      group.add(poleR);

      const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.14), signMat);
      board.position.set(0, 1.75, 0);
      board.castShadow = true;
      group.add(board);

      const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), decalMat);
      decal.position.set(0, 1.75, 0.08);
      group.add(decal);
    } else if (type === 'HANGING_LAUNDRY') {
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
      const cloth1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.8 });
      const cloth2 = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.8 });

      const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), poleMat);
      poleL.position.set(-1.05, 1.3, 0);
      group.add(poleL);

      const poleR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), poleMat);
      poleR.position.set(1.05, 1.3, 0);
      group.add(poleR);

      const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.08), cloth1);
      s1.position.set(-0.4, 1.6, 0);
      group.add(s1);

      const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.08), cloth2);
      s2.position.set(0.45, 1.6, 0);
      group.add(s2);
    } else {
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.8, 1.4), boxMat);
      box.position.y = 0.9;
      box.castShadow = true;
      group.add(box);
    }

    return group;
  }

  // --- Collectibles: Coins & Power-Ups ---

  public buildCoinMesh(): THREE.Group {
    const coinGroup = new THREE.Group();

    if (this.activeCharacter === 'doraemon') {
      // Golden Dorayaki (red bean pancake)
      const pancakeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
      const fillMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.4 });
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), pancakeMat);
      bun.scale.set(1.1, 0.45, 1.1);
      coinGroup.add(bun);
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 12), fillMat);
      coinGroup.add(ring);
    } else if (this.activeCharacter === 'bheem') {
      // Golden Laddoo for Chhota Bheem
      const laddooMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
        roughness: 0.5,
      });
      const laddoo = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 1), laddooMat);
      coinGroup.add(laddoo);
    } else if (this.activeCharacter === 'motu') {
      // Golden Crispy Samosa
      const samosaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const samosaGeo = new THREE.ConeGeometry(0.3, 0.4, 3);
      const samosa = new THREE.Mesh(samosaGeo, samosaMat);
      samosa.rotation.x = Math.PI / 4;
      coinGroup.add(samosa);
    } else if (this.activeCharacter === 'spongebob') {
      // Krabby Patty!
      const bunMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const pattyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
      const greenMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
      const topBun = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), bunMat);
      topBun.scale.set(1.1, 0.4, 1.1);
      topBun.position.y = 0.1;
      coinGroup.add(topBun);
      const patty = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.08, 12), pattyMat);
      coinGroup.add(patty);
      const lettuce = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 12), greenMat);
      lettuce.position.y = 0.05;
      coinGroup.add(lettuce);
      const botBun = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12), bunMat);
      botBun.position.y = -0.07;
      coinGroup.add(botBun);
    } else if (this.activeCharacter === 'minion') {
      // Yellow Curved Banana
      const bananaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
      const bananaTipMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.5 });
      const bananaGeo = new THREE.TorusGeometry(0.26, 0.09, 8, 14, Math.PI * 0.7);
      const banana = new THREE.Mesh(bananaGeo, bananaMat);
      banana.rotation.z = -Math.PI * 0.35;
      coinGroup.add(banana);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), bananaTipMat);
      tip.position.set(0.2, 0.18, 0);
      coinGroup.add(tip);
    } else if (this.activeCharacter === 'sonic') {
      // Glowing Golden Power Ring
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 10, 24), ringMat);
      coinGroup.add(ring);
    } else if (this.activeCharacter === 'jerry') {
      // Wedge of Swiss Cheese
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 });
      const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 5), cheeseMat);
      cheese.scale.set(1, 0.8, 1);
      coinGroup.add(cheese);
    } else if (this.activeCharacter === 'tom') {
      // Fish Bone Treat
      const boneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), boneMat);
      spine.rotation.z = Math.PI / 2;
      coinGroup.add(spine);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 4), boneMat);
      head.rotation.z = -Math.PI / 2;
      head.position.x = 0.28;
      coinGroup.add(head);
    } else if (this.activeCharacter === 'ben10') {
      // Glowing Omnitrix Capsule
      const omniMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x16a34a,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), omniMat);
      coinGroup.add(orb);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 6, 16), omniMat);
      coinGroup.add(ring);
    } else if (this.activeCharacter === 'lion') {
      // Golden Crown / Trophy
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xb45309,
        emissiveIntensity: 0.3,
      });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.12, 0.32, 10), goldMat);
      coinGroup.add(cup);
    } else if (this.activeCharacter === 'tiger') {
      // Radiant Ruby Fang
      const rubyMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.7,
        roughness: 0.1,
      });
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), rubyMat);
      coinGroup.add(gem);
    } else if (this.activeCharacter === 'vir') {
      // Glowing Cyan Power Core Orb
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), orbMat);
      coinGroup.add(orb);
    } else {
      // Classic Gold Chocobi Star Coin (Shinchan)
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x78350f,
        emissiveIntensity: 0.2,
      });
      const coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.1, 8);
      coinGeo.rotateX(Math.PI / 2);
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coinGroup.add(coin);

      const starMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xa16207, emissiveIntensity: 0.3 });
      const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), starMat);
      coinGroup.add(star);
    }

    return coinGroup;
  }

  public buildPowerUpMesh(type: PowerUpType): THREE.Group {
    const group = new THREE.Group();

    if (type === 'MAGNET') {
      // Horseshoe Magnet
      const magnetGeo = new THREE.TorusGeometry(0.32, 0.09, 8, 16, Math.PI);
      magnetGeo.rotateZ(Math.PI);
      const magnet = new THREE.Mesh(magnetGeo, this.magnetMat);
      group.add(magnet);

      // Silver tips
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.2 });
      const tipL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8), tipMat);
      tipL.position.set(-0.32, -0.05, 0);
      group.add(tipL);

      const tipR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8), tipMat);
      tipR.position.set(0.32, -0.05, 0);
      group.add(tipR);
    } else if (type === 'SHIELD') {
      // Emerald Guardian Shield Sphere
      const shield = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), this.shieldMat);
      group.add(shield);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 6, 18), this.shieldMat);
      group.add(ring);
    } else {
      // 2X Multiplier Star
      const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), this.multMat);
      group.add(star);
    }

    return group;
  }

  // --- Spawning World Loop ---

  public initWorld() {
    this.chunks.forEach((c) => this.scene.remove(c));
    this.chunks = [];
    this.clearObstaclesAndCoins();

    let currentZ = 20;
    for (let i = 0; i < TOTAL_CHUNKS; i++) {
      const chunk = this.createChunk(currentZ, i <= 1);
      this.chunks.push(chunk);
      this.scene.add(chunk);

      if (i > 1) {
        this.spawnChunkContent(currentZ);
      }

      currentZ -= CHUNK_LENGTH;
    }
    this.furthestZ = currentZ;
  }

  public clearObstaclesAndCoins() {
    this.obstacles.forEach((obs) => this.scene.remove(obs.meshGroup));
    this.obstacles = [];
    this.coins.forEach((coin) => this.scene.remove(coin.mesh));
    this.coins = [];
    this.powerUps.forEach((p) => this.scene.remove(p.mesh));
    this.powerUps = [];
  }

  private spawnChunkContent(chunkZ: number) {
    const zOffsets = [-CHUNK_LENGTH * 0.32, CHUNK_LENGTH * 0.2];

    zOffsets.forEach((offset) => {
      const targetZ = chunkZ + offset;
      const lanes: Lane[] = [-1, 0, 1];
      const blockedLanesCount = Math.random() > 0.4 ? 1 : 2;

      const shuffled = [...lanes].sort(() => Math.random() - 0.5);
      const chosenBlockedLanes = shuffled.slice(0, blockedLanesCount);

      chosenBlockedLanes.forEach((lane) => {
        let type: ObstacleType;
        const typeRoll = Math.random();
        if (typeRoll < 0.2) {
          type = 'LOW_HURDLE';
        } else if (typeRoll < 0.35) {
          type = 'GARDEN_BENCH';
        } else if (typeRoll < 0.52) {
          type = 'HIGH_SIGN';
        } else if (typeRoll < 0.68) {
          type = 'HANGING_LAUNDRY';
        } else if (typeRoll < 0.85) {
          type = 'DELIVERY_VAN';
        } else {
          type = 'MOVING_TRAIN';
        }

        const meshGroup = this.buildObstacleMesh(type);
        meshGroup.position.set(LANE_POSITIONS[lane], 0, targetZ);
        this.scene.add(meshGroup);

        const requiresSlide = type === 'HIGH_SIGN' || type === 'HANGING_LAUNDRY';
        const canJumpOver = type === 'LOW_HURDLE' || type === 'GARDEN_BENCH';
        const isMoving = type === 'MOVING_TRAIN';

        this.obstacles.push({
          id: this.nextObstacleId++,
          type,
          lane,
          z: targetZ,
          width: 1.8,
          height: requiresSlide ? 2.2 : (canJumpOver ? 0.8 : 2.5),
          requiresSlide,
          canJumpOver,
          isMoving,
          speed: isMoving ? 8 : 0, // Moves toward player!
          meshGroup,
        });
      });

      // Free lane: Spawn Coins or Rare Power-Up
      const freeLane = shuffled[shuffled.length - 1];

      // 20% chance to spawn a Power-Up!
      if (Math.random() < 0.2) {
        const pTypes: PowerUpType[] = ['MAGNET', 'SHIELD', 'MULTIPLIER'];
        const chosenType = pTypes[Math.floor(Math.random() * pTypes.length)];
        const pMesh = this.buildPowerUpMesh(chosenType);
        const pZ = targetZ + 3;
        pMesh.position.set(LANE_POSITIONS[freeLane], 1.0, pZ);
        this.scene.add(pMesh);

        this.powerUps.push({
          id: this.nextPowerUpId++,
          type: chosenType,
          lane: freeLane,
          z: pZ,
          y: 1.0,
          collected: false,
          mesh: pMesh,
        });
      } else {
        // Line of 4 coins
        const numCoins = 4;
        const coinStartZ = targetZ + 6;
        for (let c = 0; c < numCoins; c++) {
          const coinZ = coinStartZ - c * 2.2;
          const mesh = this.buildCoinMesh();
          const coinY = 0.85;
          mesh.position.set(LANE_POSITIONS[freeLane], coinY, coinZ);
          this.scene.add(mesh);

          this.coins.push({
            id: this.nextCoinId++,
            lane: freeLane,
            z: coinZ,
            y: coinY,
            collected: false,
            mesh,
          });
        }
      }
    });
  }

  public update(playerZ: number, dt: number) {
    // 1. Recycle chunks
    this.chunks.forEach((chunk) => {
      if (chunk.position.z > playerZ + CHUNK_LENGTH) {
        chunk.position.z = this.furthestZ;
        this.spawnChunkContent(this.furthestZ);
        this.furthestZ -= CHUNK_LENGTH;
      }
    });

    // 2. Animate and rotate coins
    const coinRotDelta = dt * 3.5;
    this.coins.forEach((coin) => {
      if (!coin.collected && coin.mesh) {
        coin.mesh.rotation.y += coinRotDelta;
      }
    });

    // 3. Animate Power-Ups
    this.powerUps.forEach((p) => {
      if (!p.collected && p.mesh) {
        p.mesh.rotation.y += dt * 3.0;
        p.mesh.position.y = 1.0 + Math.sin(performance.now() * 0.005) * 0.15;
      }
    });

    // 4. Update Moving Obstacles (e.g. moving train)
    this.obstacles.forEach((obs) => {
      if (obs.isMoving && obs.speed) {
        obs.z += obs.speed * dt; // moves towards player
        obs.meshGroup.position.z = obs.z;
      }
    });

    // 5. Clean up passed entities
    this.obstacles = this.obstacles.filter((obs) => {
      if (obs.z > playerZ + 25) {
        this.scene.remove(obs.meshGroup);
        return false;
      }
      return true;
    });

    this.coins = this.coins.filter((coin) => {
      if (coin.collected || coin.z > playerZ + 25) {
        this.scene.remove(coin.mesh);
        return false;
      }
      return true;
    });

    this.powerUps = this.powerUps.filter((p) => {
      if (p.collected || p.z > playerZ + 25) {
        this.scene.remove(p.mesh);
        return false;
      }
      return true;
    });
  }
}
