import { reactive } from "vue";
import { Landmarks } from "./Landmark";

/**
 * Utility class to deals with Stability
 */
class Stability {
  /**
   * Max data can be holded
   */
  static maxDataLength: number = 40;

  /**
   * Stability Data Store
   */
  static data = reactive<ArrayFixedLength<SnapshotStability, 0, 40>>([]);

  /**
   * Stddev Data Store
   */
  static stddevs = reactive<ArrayFixedLength<SnapshotStability, 0, 40>>([]);

  /**
   * Adding history data
   * @param param0 Sability data
   */
  static addHistory({ stability, stddev }: StabilityResult): void {
    this.data.push(stability);
    this.stddevs.push(stddev);

    if (this.data.length > this.maxDataLength) this.data.shift();
    if (this.stddevs.length > this.maxDataLength) this.stddevs.shift();
  }

  /**
   * Get computed Stability
   * @param index index of data
   * @param options compute options
   * @returns StabilityResult object
   */
  static compute(
    index: number,
    options: Partial<Omit<ComputeData, "sampleRate">>
  ): StabilityResult {
    let trajectory = Landmarks.getTrajectory(index);
    if (trajectory.length < 2) return { stddev: 0, stability: 1 };

    const window = options?.window ?? trajectory.length,
      tolerance = options?.tolerance ?? 0.03;

    trajectory = trajectory.slice(-window);

    // centroid
    const mean = {
      x:
        trajectory.reduce((all: number, p: Landmark) => all + p.x, 0) /
        trajectory.length,
      y:
        trajectory.reduce((all: number, p: Landmark) => all + p.y, 0) /
        trajectory.length,
    };

    // distance from centroid
    const dists = trajectory.map((p) => Math.hypot(p.x - mean.x, p.y - mean.y)),
      meanDist =
        dists.reduce((all: number, v: number) => all + v, 0) / dists.length,
      variance =
        dists.reduce((all: number, v: number) => all + (v - meanDist) ** 2, 0) /
        dists.length;

    const stddev: number = Math.sqrt(variance);
    let stability = 1 - stddev / tolerance;

    if (!isFinite(stability)) stability = 0;
    if (stability > 1) stability = 1;
    if (stability < 0) stability = 0;
    this.addHistory({ stability, stddev });

    return { stddev, stability };
  }
}

export { Stability };
