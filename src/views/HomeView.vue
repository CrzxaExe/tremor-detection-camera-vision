<script setup>
import HandStatisic from '@/components/HandStatisic.vue';
import HandTracker from '@/components/HandTracker.vue'
import { storeLandmark } from '@/utils/landmarkVariable';

function handleResults(results) {
  const hands = results.multiHandLandmarks || []
  if(Object.keys(hands).length > 0) storeLandmark(hands[0])

}
</script>

<template>
  <main class="lg:min-h-screen w-full flex flex-col lg:flex-row gap-2 lg:gap-2 justify-center items-center">
    <HandTracker :onResults="handleResults" />
    <HandStatisic />
  </main>
</template>