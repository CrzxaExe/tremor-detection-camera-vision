// ===========================
// MEMBERSHIP FUNCTIONS
// ===========================
function ampLow(x: number) {
  return x <= 2 ? 1 : x >= 5 ? 0 : (5 - x) / 3;
}

function ampMedium(x: number) {
  if (x < 3 || x > 8) return 0;
  if (x >= 4 && x <= 6) return 1;
  if (x < 4) return (x - 3) / 1;
  return (8 - x) / 2;
}

function ampHigh(x: number) {
  return x <= 6 ? 0 : x >= 9 ? 1 : (x - 6) / 3;
}

function freqNormal(x: number) {
  return x <= 6 ? 1 : x >= 10 ? 0 : (10 - x) / 4;
}

function freqHigh(x: number) {
  return x <= 6 ? 0 : x >= 10 ? 1 : (x - 6) / 4;
}

function stabilityLow(x: number) {
  // variansi kecil = stabil
  return x <= 2 ? 1 : x >= 5 ? 0 : (5 - x) / 3;
}

function stabilityHigh(x: number) {
  // variansi besar = tidak stabil
  return x <= 5 ? 0 : x >= 9 ? 1 : (x - 5) / 4;
}

// ===========================
// INFERENCE
// ===========================
function fuzzyInference(amplitude: number, frequency: number, stability: number) {
  const A_low = ampLow(amplitude);
  const A_med = ampMedium(amplitude);
  const A_high = ampHigh(amplitude);

  const F_norm = freqNormal(frequency);
  const F_high = freqHigh(frequency);

  const S_low = stabilityLow(stability);
  const S_high = stabilityHigh(stability);

  // RULE BASE
  const rule1 = Math.min(A_low, F_norm);     // none
  const rule2 = Math.min(A_med, F_norm);     // mild
  const rule3 = Math.min(A_high, F_high);    // severe
  const rule4 = Math.min(S_high, F_high);    // severe
  const rule5 = Math.min(A_med, F_high);     // medium

  return {
    none: rule1,
    mild: rule2,
    medium: rule5,
    severe: Math.max(rule3, rule4)
  };
}

// ===========================
// DEFUZZIFICATION (Weighted Average)
// ===========================
function defuzzify(output: { none: number; mild: number; medium: number; severe: number }) {
  const { none, mild, medium, severe } = output;

  // nilai crisp untuk tiap kategori
  // none=0, mild=1, medium=2, severe=3
  const num =
    (none * 0) +
    (mild * 1) +
    (medium * 2) +
    (severe * 3);

  const den = none + mild + medium + severe;

  return den === 0 ? 0 : num / den;
}

// ===========================
// MAIN FINAL FUNCTION
// ===========================
export function deteksiTremorFuzzy(amplitude: number, frequency: number, stability: number) {
  const fuzzyOut = fuzzyInference(amplitude, frequency, stability);
  const score = defuzzify(fuzzyOut);

  let kategori = "";
  if (score < 0.5) kategori = "Tidak Ada Tremor";
  else if (score < 1.5) kategori = "Ringan";
  else if (score < 2.5) kategori = "Sedang";
  else kategori = "Berat";

  return { score, kategori, fuzzyOut };
}
