import { reactive } from "vue";

export type Landmark = { x: number; y: number; z?: number };
export type Snapshot = Landmark[];

export const landmarks = reactive<Snapshot[]>([]);

export const storeLandmark = (data: Snapshot, maxLen = 600) => {
  landmarks.push(data);
  if (maxLen > 0 && landmarks.length > maxLen) landmarks.shift();
};

export const clearLandmarks = () => {
  landmarks.splice(0, landmarks.length);
};

export function getTrajectory(index: number): Landmark[] {
  return landmarks.map((s) => s?.[index]).filter(Boolean) as Landmark[];
}

export function computeAmplitude(index: number, options?: { window?: number }) {
  const traj = getTrajectory(index);
  const w = options?.window ?? traj.length;
  if (traj.length < 2) return null;
  const arr = traj.slice(-w);
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of arr) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const amplitude = Math.sqrt(dx * dx + dy * dy);
  return amplitude;
}

export function computeFrequency(
  index: number,
  options?: { window?: number; sampleRate?: number }
) {
  const sampleRate = options?.sampleRate ?? 30;
  const traj = getTrajectory(index);
  const w = options?.window ?? traj.length;
  if (traj.length < 6) return null;
  const arr = traj.slice(-w);

  // build signal: y displacement from mean
  const meanY = arr.reduce((s, p) => s + p.y, 0) / arr.length;
  const signal = arr.map((p) => p.y - meanY);

  // count zero crossings (sign changes)
  let crossings = 0;
  for (let i = 1; i < signal.length; i++) {
    const prev = signal[i - 1];
    const curr = signal[i];
    if (prev === undefined || curr === undefined) continue;
    if (prev === 0) continue;
    if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) crossings++;
  }

  const durationSec = arr.length / sampleRate;
  if (durationSec <= 0) return null;

  // For a sinusoid, two zero-crossings per cycle -> freq = crossings / (2 * duration)
  const freqHz = crossings / (2 * durationSec);
  return freqHz;
}

export function computeStability(
  index: number,
  options?: { window?: number; tolerance?: number }
) {
  const traj = getTrajectory(index);
  const w = options?.window ?? traj.length;
  if (traj.length < 2) return { stddev: 0, stability: 1 };
  const arr = traj.slice(-w);

  // centroid
  const meanX = arr.reduce((s, p) => s + p.x, 0) / arr.length;
  const meanY = arr.reduce((s, p) => s + p.y, 0) / arr.length;

  // distances from centroid
  const dists = arr.map((p) => Math.hypot(p.x - meanX, p.y - meanY));
  const meanDist = dists.reduce((s, v) => s + v, 0) / dists.length;
  const variance =
    dists.reduce((s, v) => s + (v - meanDist) * (v - meanDist), 0) /
    dists.length;
  const stddev = Math.sqrt(variance);

  const tolerance = options?.tolerance ?? 0.03;
  let stability = 1 - stddev / tolerance;
  if (!isFinite(stability)) stability = 0;
  if (stability > 1) stability = 1;
  if (stability < 0) stability = 0;

  return { stddev, stability };
}

export default {
  landmarks,
  storeLandmark,
  clearLandmarks,
  getTrajectory,
  computeAmplitude,
  computeFrequency,
  computeStability,
};
