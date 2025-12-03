<template>
    <div class="w-full lg:min-h-[420px] py-2 lg:py-4 px-3 lg:p-6 max-w-120 bg-zinc-300 rounded-lg flex flex-col gap-5">
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
        <div class="flex flex-row justify-around">
            <div class="flex flex-col items-center bg-rose-500 px-5 py-1 w-25 h-20 gap-1">
                <span class="text-gray-100 text-xl">Normal</span>
                <span class="text-gray-100">{{ fuzzyResult.confidence.Normal ?? 0 }}</span>
            </div>
            <div class="flex flex-col items-center bg-rose-500 px-5 py-1 w-25 h-20 gap-1">
                <span class="text-gray-100 text-xl">Mild</span>
                <span class="text-gray-100">{{ fuzzyResult.confidence.Mild ?? 0 }}</span>
            </div>
            <div class="flex flex-col items-center bg-rose-500 px-5 py-1 w-25 h-20 gap-1">
                <span class="text-gray-100 text-xl">Severe</span>
                <span class="text-gray-100">{{ fuzzyResult.confidence.Severe ?? 0 }}</span>
            </div>
        </div>
        <div class="bg-rose-500 p-5">
            <span class="text-gray-100 text-2xl">Tremor: {{ fuzzyResult.label }}</span>
        </div>
    </div>
</template>

<script setup>
import { computeAmplitude, computeFrequency, computeStability } from '@/utils/landmarkVariable';
import { inferTremor } from '@/utils/fuzzy';
import { ref } from 'vue';

const fuzzyResult = ref({
    value: 0,
    label: "Yogak",
    confidence: {Normal: 1, Mild: 0, Severe: 0}
})

const amplitude = ref(0);
const frequency = ref(0);
const stability = ref();
setInterval(() => {
    amplitude.value = computeAmplitude(0, { window: 60 });
    frequency.value = computeFrequency(0, { window: 120, sampleRate: 30 });
    stability.value = computeStability(0, { window: 60, tolerance: 0.03 });

    fuzzyResult.value = inferTremor(amplitude.value, frequency.value, stability.value.stability);
}, 100)
</script>