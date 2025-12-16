<script setup lang="ts">
import GraphResult from '@/components/GraphResult.vue';
import HandTracker from '@/components/HandTracker.vue'
import HeaderVue from '@/components/Header.vue';
import InfoVue from '@/components/Info.vue';
import Prediction from '@/components/Prediction.vue';
import Settings from '@/components/Settings.vue';
import { Amplitude } from '@/lib/Amplitude';
import { Frequency } from '@/lib/Frequency';
import { Landmarks } from '@/lib/Landmark';
import { Stability } from '@/lib/Stability';
import { inferTremor } from '@/utils/fuzzy';
import type { Results } from '@mediapipe/hands';
import { nextTick, onMounted, reactive, ref } from 'vue';

const amplitude = ref<number>(0);
const frequency = ref<number>(0);
const stability = ref({ stddev: 0, stability: 0 });
let settings: SettingsResult = reactive({ window: 60, tolerance: 0.03, sampleRates: 30 });
let fuzzyResult = reactive({
    value: 0,
    label: "Yogak",
    confidence: {Normal: 1, Mild: 0, Severe: 0}
})

function handleResults(results: Results) {
  const hands = results.multiHandLandmarks || []
  if(Object.keys(hands).length > 0) Landmarks.store(hands[0] as SnapshotLandmark)
}
const handleSettings = (result: SettingsResult) => {
  Object.assign(settings, result);
}

onMounted(() => {
  setInterval(() => {
    amplitude.value = (Amplitude.compute(0, { window: settings.window })) as number;
    frequency.value = (Frequency.compute(0, { window: settings.window, sampleRate: settings.sampleRates }) ?? 0) as number;
    stability.value = Stability.compute(0, { window: settings.window, tolerance: settings.tolerance });
    
    const result = inferTremor(amplitude.value, frequency.value, stability.value.stability);
    Object.assign(fuzzyResult, result);
    nextTick();
  }, 250)
})

</script>

<template>
  <main class="w-full">
    <section class="w-full min-h-screen lg:max-h-screen px-4 lg:px-0 py-2 lg:py-4 pt-32 lg:pt-24 flex lg:justify-center lg:items-center overflow-x-hidden overflow-y-visible lg:overflow-y-hidden font-dashboard font-normal">
      <div class="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-5 gap-2 lg:gap-4 xl:gap-8 w-full lg:max-w-400">
        <Settings :onResults="handleSettings" />
        <HandTracker :onResults="handleResults" />
        <Prediction :model='{ ...fuzzyResult.confidence, label: fuzzyResult.label }' />
        <InfoVue />
        <GraphResult :amplitude :frequency :stability />
      </div>
    </section>
  </main>
</template>