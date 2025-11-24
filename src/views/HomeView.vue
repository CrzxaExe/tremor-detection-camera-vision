<script setup>
import HandTracker from '@/components/HandTracker.vue'
import { landmarks, storeLandmark } from '@/utils/landmarkVariable';

function handleResults(results) {
  const hands = results.multiHandLandmarks || []
  if(Object.keys(hands).length > 0) storeLandmark(hands[0])

  console.log(landmarks)
}
</script>

<template>
  <main class="min-h-screen w-full flex justify-center items-center">
    <HandTracker :onResults="handleResults" />
  </main>
</template>