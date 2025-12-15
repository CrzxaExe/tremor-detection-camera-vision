// Linear membership helper
function triangle(x: number, a: number, b: number, c: number) {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// OVERSENSITIVE?

// -------------------
// Amplitude
// -------------------
function ampLow(x: number) {
  return triangle(x, -0.01, 0, 0.02);
}
function ampMed(x: number) {
  return triangle(x, 0.01, 0.025, 0.04);
}
function ampHigh(x: number) {
  return triangle(x, 0.03, 0.06, 10.0);
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
  return triangle(x, 0.7, 0.8, 0.9);
}
function stabUnstable(x: number) {
  return triangle(x, -1, 0.6, 0.75);
}