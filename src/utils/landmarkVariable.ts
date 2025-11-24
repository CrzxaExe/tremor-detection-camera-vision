import { reactive } from "vue";

export const landmarks = reactive<Vector3[]>([]);

export const storeLandmark = (data: Vector3) => {
  landmarks.push(data);
};
