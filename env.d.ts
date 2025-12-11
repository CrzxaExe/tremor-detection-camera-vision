/// <reference types="vite/client" />

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type Landmark = { x: number; y: number; z?: number };
type SnapshotLandmark = Landmark[];

type SnapshotAmplitude = number[];
type SnapshotFrequency = number[];
type SnapshotStability = number[];
