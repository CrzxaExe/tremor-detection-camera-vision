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