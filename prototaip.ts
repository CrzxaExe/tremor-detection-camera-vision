// Linear membership helper
function triangle(x: number, a: number, b: number, c: number) {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
}
// Amplitude
function ampLow(x: number) {
    return triangle(x, 0, 0.25, 0.5);
}
function ampMed(x: number) {
    return triangle(x, 0.3, 0.75, 1.2);
}
function ampHigh(x: number) {
    return triangle(x, 1, 2, 3);
}

// Frequency
function freqLow(x: number) {
    return triangle(x, 0, 2, 4);
}
function freqMed(x: number) {
    return triangle(x, 4, 6, 8);
}
function freqHigh(x: number) {
    return triangle(x, 8, 10, 12);
}
// Stability
function stabStable(x: number) {
    return triangle(x, 0, 0.025, 0.05);
}
function stabMid(x: number) {
    return triangle(x, 0.03, 0.065, 0.1);
}
function stabUnstable(x: number) {
    return triangle(x, 0.08, 0.14, 0.2);
}

function inferTremor(amplitude: number, frequency: number, stability: number) {
    // fuzzification
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

    // rules
    const rules = [
        { a: A.low, f: F.low, s: S.stable, out: 0 },
        { a: A.low, f: F.med, s: S.stable, out: 0.5 },

        { a: A.med, f: F.med, s: S.mid, out: 0.5 },

        { a: A.high, f: F.high, s: S.unstable, out: 1 },
        { a: A.high, f: F.med, s: S.unstable, out: 1 },
        { a: A.med, f: F.high, s: S.unstable, out: 1 },

        { a: A.low, f: F.high, s: S.unstable, out: 0.5 },
    ];
}


function defuzzify(rules: { w: number; out: number }[]) {
    let weighted = 0;
    let sumWeight = 0;

    for (const r of rules) {
        weighted += r.w * r.out;
        sumWeight += r.w;
    }

    // jika tidak ada rule aktif → output 0
    if (sumWeight === 0) return 0;

    return weighted / sumWeight;
}

