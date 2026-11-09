import * as THREE from 'three';

export interface ICharacterModel {
  group: THREE.Group;
  shadowMesh: THREE.Mesh;
  setPowerupActive(active: boolean): void;
  applySkin?(skinId: string): void;
  triggerHit(): void;
  reset(): void;
  updateAnimation(
    dt: number,
    state: 'RUN' | 'JUMP' | 'SLIDE' | 'IDLE' | 'HIT',
    jumpY: number,
    slideProgress: number,
    speedMultiplier: number
  ): void;
}
