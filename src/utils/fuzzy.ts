// Linear membership helper
function triangle(x: number, a: number, b: number, c: number) {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
}

// -------------------
// Amplitude
// -------------------
function ampLow(x: number) {
    return triangle(x, 0, 0.25, 0.5);
}
function ampMed(x: number) {
    return triangle(x, 0.3, 0.75, 1.2);
}
function ampHigh(x: number) {
    return triangle(x, 1, 2, 3);
}

// -------------------
// Frequency
// -------------------
function freqLow(x: number) {
    return triangle(x, 0, 2, 4);
}
function freqMed(x: number) {
    return triangle(x, 4, 6, 8);
}
function freqHigh(x: number) {
    return triangle(x, 8, 10, 12);
}

// -------------------
// Stability
// -------------------
function stabStable(x: number) {
    return triangle(x, 0, 0.025, 0.05);
}
function stabMid(x: number) {
    return triangle(x, 0.03, 0.065, 0.1);
}
function stabUnstable(x: number) {
    return triangle(x, 0.08, 0.14, 0.2);
}


//
//
//
function classifyTremor(value: number): string {
    if (value < 0.25) return "Normal";
    if (value < 0.7) return "Mild";
    return "Severe";
}

// Membership functions untuk output
function outNormal(x: number): number {
    if (x <= 0) return 1;
    if (x >= 0.4) return 0;
    return (0.4 - x) / 0.4; // turun dari 1 → 0
}

function outMild(x: number): number {
    if (x < 0.1 || x > 0.9) return 0;
    if (x <= 0.5) return (x - 0.1) / 0.4; // naik 0 → 1
    return (0.9 - x) / 0.4; // turun 1 → 0
}

function outSevere(x: number): number {
    if (x <= 0.5) return 0;
    if (x >= 1) return 1;
    return (x - 0.5) / 0.5; // naik 0 → 1
}

function computeOutputConfidence(value: number) {
    const n = outNormal(value);
    const m = outMild(value);
    const s = outSevere(value);
    console.log(`${n}\n${m}\n${s}\n`)

    const sum = n + m + s || 1; // hindari divisi nol

    return {
        Normal: n / sum,
        Mild: m / sum,
        Severe: s / sum
    };
}

// ---------- INFERENSI FUZZY ----------

function inferTremor(amplitude: number, frequency: number, stability: number) {
    // FUZZIFICATION
    const A = {
        low: ampLow(amplitude),
        med: ampMed(amplitude),
        high: ampHigh(amplitude),
    };

    const F = {
        low: freqLow(frequency),
        med: freqMed(frequency),
        high: freqHigh(frequency),
    };

    const S = {
        stable: stabStable(stability),
        mid: stabMid(stability),
        unstable: stabUnstable(stability),
    };

    // RULES
    const rules = [
        { a: A.low, f: F.low, s: S.stable, out: 0 },
        { a: A.low, f: F.med, s: S.stable, out: 0.5 },

        { a: A.med, f: F.med, s: S.mid, out: 0.5 },

        { a: A.high, f: F.high, s: S.unstable, out: 1 },
        { a: A.high, f: F.med, s: S.unstable, out: 1 },
        { a: A.med, f: F.high, s: S.unstable, out: 1 },

        { a: A.low, f: F.high, s: S.unstable, out: 0.5 },
    ];

    // INFERENCE
    let weighted = 0;
    let totalWeight = 0;

    for (const r of rules) {
        const w = Math.min(r.a, r.f, r.s);
        weighted += w * r.out;
        totalWeight += w;
    }

    const crisp = totalWeight === 0 ? 0 : (weighted / totalWeight);

    // CLASS LABEL
    const label = classifyTremor(crisp);

    // CONFIDENCE SCORE
    const confidence = computeOutputConfidence(crisp);

    return { value: crisp, label, confidence };
}

const result = inferTremor(0.18, 1.8, 0.015);

console.log(result);
