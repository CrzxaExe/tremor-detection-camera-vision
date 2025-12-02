<template>
    <div class="w-full lg:min-h-[420px] py-2 lg:py-4 px-3 lg:p-6 max-w-120 bg-zinc-300 rounded-lg flex flex-col">
        <div class="flex flex-row gap-2 lg:gap-4 w-full justify-around py-4">
            <div class="text-xl lg:text-2xl text-rose-500 font-bold flex flex-col justify-center items-center">
                <h4>Amplitude</h4>
                <span>{{ (amplitude ?? 0).toFixed(2) }}</span>
                
            </div>
            <div class="text-xl lg:text-2xl text-rose-500 font-bold flex flex-col justify-center items-center">
                <span>{{ (frequency ?? 0).toFixed(2) }}Hz</span>
                
            </div>
        </div>
        <span class="block">{{ stability ?? 0 }}</span>
    </div>
</template>

<script setup>
import { computeAmplitude, computeFrequency, computeStability } from '@/utils/landmarkVariable';
import { ref } from 'vue';

const amplitude = ref(0);
const frequency = ref(0);
const stability = ref();
setInterval(() => {
    amplitude.value = computeAmplitude(0, { window: 60 });
    frequency.value = computeFrequency(0, { window: 120, sampleRate: 30 });
    stability.value = computeStability(0, { window: 60, tolerance: 0.03 });
}, 100)
</script>