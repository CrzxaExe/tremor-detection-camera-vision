import { reactive } from "vue";
// ----------------------------------------------------
//  Import FFT library
//  npm install fft-js
// ----------------------------------------------------
import { fft, util } from "fft-js";

export const landmarks = reactive<Vector3[]>([]);

export const storeLandmark = (data: Vector3) => {
  landmarks.push(data);
};


// ----------------------------------------------------
// 1. Hitung Amplitudo
// ----------------------------------------------------
export function hitungAmplitudo(signal: number[]): number {
    const maxVal = Math.max(...signal);
    const minVal = Math.min(...signal);
    const amplitude = (maxVal - minVal) / 2;
    return amplitude;
}

// ----------------------------------------------------
// 2. Hitung Frekuensi Dominan via FFT
// ----------------------------------------------------
export function hitungFrekuensiDominan(
    signal: number[],
    samplingRate: number
): number {
    const N = signal.length;

    // FFT
    const phasors = fft(signal);
    const magnitudes = util.fftMag(phasors);

    // Buat array frekuensi
    const freqs = Array.from({ length: N }, (_, i) => (i * samplingRate) / N);

    // Abaikan frekuensi DC (index 0)
    magnitudes[0] = 0;

    // Cari indeks magnitudo terbesar
    const peakIndex = magnitudes.indexOf(Math.max(...magnitudes));

    return freqs[peakIndex];
}

// ----------------------------------------------------
// 3. Hitung Stabilitas Sinyal
//    Stabilitas dihitung per window (misal 1 detik)
// ----------------------------------------------------
export function hitungStabilitas(
    signal: number[],
    samplingRate: number,
    windowSec: number = 1
) {
    const windowSize = Math.floor(windowSec * samplingRate);
    const amplitudes: number[] = [];
    const freqs: number[] = [];

    for (let i = 0; i < signal.length; i += windowSize) {
        const chunk = signal.slice(i, i + windowSize);
        if (chunk.length < windowSize) break;

        amplitudes.push(hitungAmplitudo(chunk));
        freqs.push(hitungFrekuensiDominan(chunk, samplingRate));
    }

    const meanAmp = mean(amplitudes);
    const stdAmp = std(amplitudes);

    const meanFreq = mean(freqs);
    const stdFreq = std(freqs);

    return {
        amplitudo_per_window: amplitudes,
        frekuensi_per_window: freqs,

        stabilitas_amplitudo: stdAmp,
        stabilitas_frekuensi: stdFreq,

        coefficient_of_variation_amp: stdAmp / meanAmp,
        coefficient_of_variation_freq: stdFreq / meanFreq
    };
}

// ----------------------------------------------------
// Helper: Mean
// ----------------------------------------------------
function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ----------------------------------------------------
// Helper: Standard Deviation
// ----------------------------------------------------
function std(arr: number[]): number {
    const m = mean(arr);
    const variance = arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

// ----------------------------------------------------
// 4. Contoh Penggunaan
// ----------------------------------------------------
const Fs = 100; // sampling rate 100 Hz
const exampleSignal = Array.from({ length: 1000 }, (_, i) =>
    Math.sin(2 * Math.PI * 5 * (i / Fs)) + 0.2 * (Math.random() - 0.5) // sinyal 5 Hz + noise
);

console.log("Amplitudo:", hitungAmplitudo(exampleSignal));
console.log("Frekuensi Dominan:", hitungFrekuensiDominan(exampleSignal, Fs));

const stabilitas = hitungStabilitas(exampleSignal, Fs, 1);
console.log("Stabilitas:", stabilitas);
