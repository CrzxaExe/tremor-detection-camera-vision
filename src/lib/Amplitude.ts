import { reactive } from "vue";
import { Landmarks } from "./Landmark";

/**
 * Utility class to deals with Amplitude
 */
class Amplitude {
  /**
   * Max length of data
   */
  static maxDataLength: number = 40;

  /**
   * Amplitude Data store
   */
  static data = reactive<ArrayFixedLength<SnapshotAmplitude, 0, 40>>([]);

  /**
   * Add new history data of Amplitude
   * @param data amplitude data
   */
  static addHistory(data: number) {
    this.data.push(data);

    if (this.maxDataLength > 0 && this.data.length > this.maxDataLength)
      this.data.shift();
  }
  /**
   * Get computed amplitude
   * @param index index of data
   * @param options compute options
   * @returns number or null
   */
  static compute(
    index: number = 0,
    options: Partial<Pick<ComputeData, "window">>
  ): number | null {
    let trajectory: Landmark[] = Landmarks.getTrajectory(index);
    if (trajectory.length < 2) return null;

    const window: number = options?.window ?? trajectory.length;
    trajectory = trajectory.slice(-window);

    const compute = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };

    for (const p of trajectory) {
      if (p.x < compute.minX) compute.minX = p.x;
      if (p.x > compute.maxX) compute.maxX = p.x;
      if (p.y < compute.minY) compute.minY = p.y;
      if (p.y > compute.maxY) compute.maxY = p.y;
    }
    const dx = compute.maxX - compute.minX,
      dy = compute.maxY - compute.minY;

    const amplitude: number = Math.sqrt(dx * dx + dy * dy);
    this.addHistory(amplitude);

    return amplitude;
  }
}

export { Amplitude };
