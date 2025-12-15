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
  return triangle(x, -0.01, 0, 0.03);
}
function ampMed(x: number) {
  return triangle(x, 0.02, 0.04, 0.06);
}
function ampHigh(x: number) {
  return triangle(x, 0.04, 0.08, 10.0);
}

// -------------------
// Frequency
// -------------------
function freqLow(x: number) {
  return triangle(x, -1, 0.5, 1.5);
}
function freqMed(x: number) {
  return triangle(x, 1.0, 1.75, 2.5);
}
function freqHigh(x: number) {
  return triangle(x, 2.0, 3.0, 10);
}

// -------------------
// Stability
// -------------------
function stabStable(x: number) {
  return triangle(x, 0.85, 0.95, 1.1);
}
function stabMid(x: number) {
  return triangle(x, 0.65, 0.8, 0.9);
}
function stabUnstable(x: number) {
  return triangle(x, -1, 0.5, 0.7);
}

// -------------------
// OUTPUT MEMBERSHIP FUNCTIONS
// -------------------

function classifyTremor(value: number): string {
  if (value < 0.35) return "Normal";
  if (value < 0.75) return "Mild";
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
  // console.log(`${n}\n${m}\n${s}\n`)

  const sum = n + m + s || 1; // hindari divisi nol

  return {
    Normal: parseFloat((n / sum).toFixed(2)),
    Mild: parseFloat((m / sum).toFixed(2)),
    Severe: parseFloat((s / sum).toFixed(2)),
  };
}

// ---------- INFERENSI FUZZY ----------

export function inferTremor(
  amplitude: number,
  frequency: number,
  stability: number
) {
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
    // --- AMP LOW ---
    { a: A.low, f: F.low, s: S.stable, out: 0 }, // Normal
    { a: A.low, f: F.low, s: S.mid, out: 0 }, // Normal
    { a: A.low, f: F.low, s: S.unstable, out: 0.5 }, // Mild (Jitter)

    { a: A.low, f: F.med, s: S.stable, out: 0 }, // Normal
    { a: A.low, f: F.med, s: S.mid, out: 0.5 }, // Mild
    { a: A.low, f: F.med, s: S.unstable, out: 0.5 }, // Mild

    { a: A.low, f: F.high, s: S.stable, out: 0.5 }, // Mild (High freq tremor)
    { a: A.low, f: F.high, s: S.mid, out: 0.5 }, // Mild
    { a: A.low, f: F.high, s: S.unstable, out: 0.5 }, // Mild

    // --- AMP MED ---
    { a: A.med, f: F.low, s: S.stable, out: 0.5 }, // Mild
    { a: A.med, f: F.low, s: S.mid, out: 0.5 }, // Mild
    { a: A.med, f: F.low, s: S.unstable, out: 1 }, // Severe (Tidak stabil!)

    { a: A.med, f: F.med, s: S.stable, out: 0.5 }, // Mild
    { a: A.med, f: F.med, s: S.mid, out: 1 }, // Severe
    { a: A.med, f: F.med, s: S.unstable, out: 1 }, // Severe

    { a: A.med, f: F.high, s: S.stable, out: 1 }, // Severe
    { a: A.med, f: F.high, s: S.mid, out: 1 }, // Severe
    { a: A.med, f: F.high, s: S.unstable, out: 1 }, // Severe

    // --- AMP HIGH ---
    { a: A.high, f: F.low, s: S.stable, out: 0.5 }, // Mild (Gerakan lambat besar = Sengaja?)
    { a: A.high, f: F.low, s: S.mid, out: 1 }, // Severe
    { a: A.high, f: F.low, s: S.unstable, out: 1 }, // Severe

    { a: A.high, f: F.med, s: S.stable, out: 1 }, // Severe
    { a: A.high, f: F.med, s: S.mid, out: 1 }, // Severe
    { a: A.high, f: F.med, s: S.unstable, out: 1 }, // Severe

    { a: A.high, f: F.high, s: S.stable, out: 1 }, // Severe
    { a: A.high, f: F.high, s: S.mid, out: 1 }, // Severe
    { a: A.high, f: F.high, s: S.unstable, out: 1 }, // Severe
  ];
  // INFERENCE
  let weighted = 0;
  let totalWeight = 0;

  for (const r of rules) {
    const w = Math.min(r.a, r.f, r.s);
    weighted += w * r.out;
    totalWeight += w;
  }

  const crisp = totalWeight === 0 ? 0 : weighted / totalWeight;

  // CLASS LABEL
  const label = classifyTremor(crisp);

  // CONFIDENCE SCORE
  const confidence = computeOutputConfidence(crisp);

  return { value: crisp, label, confidence };
}
