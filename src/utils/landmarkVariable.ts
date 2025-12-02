import { reactive } from "vue";
// import { fft, util } from "fft-js";

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

// // ----------------------------------------------------
// // 1. Hitung Amplitudo
// // ----------------------------------------------------
// export function hitungAmplitudo(signal: number[]): number {
//   const maxVal = Math.max(...signal);
//   const minVal = Math.min(...signal);
//   const amplitude = (maxVal - minVal) / 2;
//   return amplitude;
// }

// // ----------------------------------------------------
// // 2. Hitung Frekuensi Dominan via FFT
// // ----------------------------------------------------
// export function hitungFrekuensiDominan(
//   signal: number[],
//   samplingRate: number
// ): number {
//   const N = signal.length;

//   // FFT
//   const phasors = fft(signal);
//   const magnitudes = util.fftMag(phasors);

//   // Buat array frekuensi
//   const freqs = Array.from({ length: N }, (_, i) => (i * samplingRate) / N);

//   // Abaikan frekuensi DC (index 0)
//   magnitudes[0] = 0;

//   // Cari indeks magnitudo terbesar
//   const peakIndex = magnitudes.indexOf(Math.max(...magnitudes));

//   return freqs[peakIndex]!;
// }

// // ----------------------------------------------------
// // 3. Hitung Stabilitas Sinyal
// //    Stabilitas dihitung per window (misal 1 detik)
// // ----------------------------------------------------
// export function hitungStabilitas(
//   signal: number[],
//   samplingRate: number,
//   windowSec: number = 1
// ) {
//   const windowSize = Math.floor(windowSec * samplingRate);
//   const amplitudes: number[] = [];
//   const freqs: number[] = [];

//   for (let i = 0; i < signal.length; i += windowSize) {
//     const chunk = signal.slice(i, i + windowSize);
//     if (chunk.length < windowSize) break;

//     amplitudes.push(hitungAmplitudo(chunk));
//     freqs.push(hitungFrekuensiDominan(chunk, samplingRate));
//   }

//   const meanAmp = mean(amplitudes);
//   const stdAmp = std(amplitudes);

//   const meanFreq = mean(freqs);
//   const stdFreq = std(freqs);

//   return {
//     amplitudo_per_window: amplitudes,
//     frekuensi_per_window: freqs,

//     stabilitas_amplitudo: stdAmp,
//     stabilitas_frekuensi: stdFreq,

//     coefficient_of_variation_amp: stdAmp / meanAmp,
//     coefficient_of_variation_freq: stdFreq / meanFreq,
//   };
// }

// // ----------------------------------------------------
// // Helper: Mean
// // ----------------------------------------------------
// function mean(arr: number[]): number {
//   return arr.reduce((a, b) => a + b, 0) / arr.length;
// }

// // ----------------------------------------------------
// // Helper: Standard Deviation
// // ----------------------------------------------------
// function std(arr: number[]): number {
//   const m = mean(arr);
//   const variance =
//     arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;
//   return Math.sqrt(variance);
// }

// // ----------------------------------------------------
// // 4. Contoh Penggunaan
// // ----------------------------------------------------
// const Fs = 100; // sampling rate 100 Hz
// const exampleSignal = Array.from(
//   { length: 1000 },
//   (_, i) => Math.sin(2 * Math.PI * 5 * (i / Fs)) + 0.2 * (Math.random() - 0.5) // sinyal 5 Hz + noise
// );
