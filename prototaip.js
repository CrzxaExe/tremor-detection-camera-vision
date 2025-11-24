// ==== Membership Functions (Triangular / Trapezoidal) ====

// Helper: triangular membership
function trimf(x, [a, b, c]) {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > b && x < c) return (c - x) / (c - b);
    return 0;
}

// ==== Fuzzy Inputs ====

// Amplitudo
function amp_low(x)    { return trimf(x, [0, 0, 4]); }
function amp_med(x)    { return trimf(x, [3, 5, 7]); }
function amp_high(x)   { return trimf(x, [6, 10, 10]); }

// Frekuensi
function freq_norm(x)  { return trimf(x, [0, 0, 4]); }
function freq_poss(x)  { return trimf(x, [3, 7, 10]); }
function freq_trem(x)  { return trimf(x, [8, 20, 20]); }

// Stabilitas
function stab_stable(x)    { return trimf(x, [0.7, 1.0, 1.0]); }
function stab_unstable(x)  { return trimf(x, [0, 0, 0.5]); }


function fuzzyInference(amp, freq, stab) {

    // Rule 1: low amplitude + normal freq + stable => low tremor
    const r1 = Math.min(amp_low(amp), freq_norm(freq), stab_stable(stab));

    // Rule 2: medium amplitude + possible freq + stable => medium tremor
    const r2 = Math.min(amp_med(amp), freq_poss(freq), stab_stable(stab));

    // Rule 3: high amplitude + tremor freq + unstable => high tremor
    const r3 = Math.min(amp_high(amp), freq_trem(freq), stab_unstable(stab));

    return { r1, r2, r3 };
}

function defuzzify({ r1, r2, r3 }) {
    // Low = 20, Medium = 50, High = 85 (centroid representasi kasar)
    const numerator = (r1 * 20) + (r2 * 50) + (r3 * 85);
    const denominator = r1 + r2 + r3 || 1;
    return numerator / denominator;

}
