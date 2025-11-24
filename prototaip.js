function extractPoint(landmarks: Point3D[], index: number): Point3D {
  const lm = landmarks[index]
  return { x: lm.x, y: lm.y, z: lm.z }
}
function computeAmplitude(positions: TremorBuffer): number {
  const xs = positions.map(p => p.x)
  const ys = positions.map(p => p.y)

  const mean = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length

  const std = (arr: number[]) => {
    const m = mean(arr)
    return Math.sqrt(arr.map(v => (v - m) ** 2).reduce((a, b) => a + b, 0) / arr.length)
  }

  return Math.sqrt(std(xs) ** 2 + std(ys) ** 2)
}
function computeFrequency(positions: TremorBuffer): number {
  const xs = positions.map(p => p.x)
  const N = xs.length

  const re = Array(N).fill(0)
  const im = Array(N).fill(0)

  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N
      re[k] += xs[n] * Math.cos(angle)
      im[k] -= xs[n] * Math.sin(angle)
    }
  }

  const magnitudes = re.map((r, i) => Math.sqrt(r * r + im[i] * im[i]))

  const maxIdx = magnitudes.indexOf(Math.max(...magnitudes))

  const FPS = 30
  return (maxIdx * FPS) / N
}
function computeStability(positions: TremorBuffer): number {
  const diffs: number[] = []

  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x
    const dy = positions[i].y - positions[i - 1].y
    diffs.push(Math.sqrt(dx * dx + dy * dy))
  }

  const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length
  const variance = diffs.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / diffs.length

  return 1 / (1 + variance)
}
