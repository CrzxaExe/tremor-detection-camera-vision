import { reactive } from "vue";

/**
 * Utility class to store Landmark data
 */
class Landmarks {
  /**
   * Landmark data store
   */
  static data = reactive<SnapshotLandmark[]>([]);

  /**
   * Add new history data of Landmark
   * @param data Snapshoot from mediapipe
   * @param maxLen max of the data can be stored
   */
  static store(data: SnapshotLandmark, maxLen: number = 100): void {
    this.data.push(data);
    if (maxLen > 0 && this.data.length > maxLen) this.data.shift();
  }

  /**
   * Clear all Landmark data
   */
  static clear(): void {
    this.data.splice(0, this.data.length);
  }

  /**
   * Get landmark trajectory
   * @param index Landmark index
   * @returns Landmark data
   */
  static getTrajectory(index: number): Landmark[] {
    return this.data
      .map((s: Landmark[]) => s?.[index])
      .filter(Boolean) as Landmark[];
  }
}

export { Landmarks };
