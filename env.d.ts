/// <reference types="vite/client" />

type Landmark = { x: number; y: number; z?: number };
type SnapshotLandmark = Landmark[];

type SnapshotAmplitude = number;
type SnapshotFrequency = number;
type SnapshotStability = number;

type ComputeData = {
  window: number;
  sampleRate: number;
  tolerance: number;
};
type StabilityResult = {
  stddev: number;
  stability: number;
};
type SettingsResult = {
  window: number;
  tolerance: number;
  sampleRates: number;
};

// Function Types
type ArrayFixedLength<
  T,
  Min extends number,
  Max extends number,
  A extends (T | undefined)[] = [],
  O extends boolean = false
> = O extends false
  ? Min extends A["length"]
    ? ArrayFixedLength<T, Min, Max, A, true>
    : ArrayFixedLength<T, Min, Max, [...A, T], false>
  : Max extends A["length"]
  ? A
  : ArrayFixedLength<T, Min, Max, [...A, T?], false>;
