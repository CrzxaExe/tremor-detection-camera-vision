import { reactive } from "vue";
import { Landmarks } from "./Landmark";

/**
 * Utility class to deals with Frequency
 */
class Frequency {
  /**
   * Max length of data
   */
  static maxDataLength: number = 40;

  /**
   * Frequency Data store
   */
  static data = reactive<ArrayFixedLength<SnapshotFrequency, 0, 40>>([]);

  /**
   * Add new history data of Frequency
   * @param data frequncy data
   */
  static addHistory(data: number) {
    this.data.push(data);

    if (this.maxDataLength > 0 && this.data.length > this.maxDataLength)
      this.data.shift();
  }

  /**
   * Get computed Frequency
   * @param index index of data
   * @param options compute options
   * @returns number or null
   */
  static compute(
    index: number = 0,
    options: Partial<Omit<ComputeData, "tolerance">>
  ): number | null {
    let trajectory: Landmark[] = Landmarks.getTrajectory(index);
    if (trajectory.length < 6) return null;

    const window: number = options?.window ?? trajectory.length;
    const sampleRate: number = options?.sampleRate ?? 30;
    trajectory = trajectory.slice(-window);

    const meanY =
      trajectory.reduce((all: number, curr: Landmark) => all + curr.y, 0) /
      trajectory.length;
    const signal = trajectory.map((e: Landmark) => e.y - meanY);

    let crossings = 0;
    for (let i = 1; i < signal.length; i++) {
      const prev = signal[i - 1];
      const curr = signal[i];

      if (prev === undefined || curr === undefined) continue;
      if (prev === 0) continue;
      if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) crossings++;
    }

    const duration = trajectory.length / sampleRate;
    if (duration <= 0) return null;

    const freqHz: number = crossings / (2 * duration);
    this.addHistory(freqHz);

    return freqHz;
  }
}

export { Frequency };
