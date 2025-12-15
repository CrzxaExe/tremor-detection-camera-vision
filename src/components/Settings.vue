<template>
    <div class="col-span-2 lg:col-span-1 lg:row-span-3 w-full py-1 text-primary-800">
        <h1 class="text-lg lg:text-2xl font-bold">Settings</h1>
        <h2 class="text-sm lg:text-base font-light tracking-wide">Adjust how motion data is sampled</h2>

        <div class="mt-4 lg:mt-8 block w-full">
            <div class="w-full">
                <h3 class="text-base lg:text-xl font-bold">Window</h3>
                <div class="flex flex-col w-full">
                    <div class="flex flex-row justify-between w-full">
                        <p class="font-light tracking-wide">A lot of data calculated</p>
                        <span class="text-lg lg:text-xl">{{ windowSettings }}</span>
                    </div>
                    
                    <div class="flex flex-col w-full mt-2">
                        <input type="range" :min="30" :value="60" :max="90" v-model.number="windowSettings" class="w-full h-4 lg:h-6 appearance-none rounded-lg cursor-pointer border" :style="windowStyle">
                        <div class="w-full flex flex-row justify-between text-xs px-2">
                            <div v-for="(e, i) in rangeWindow" :key="i" class="flex flex-col justify-center items-center">
                                <span class="block h-1.5 w-px bg-primary-800"></span>
                                <span class="block font-light">{{ e }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full mt-4 lg:mt-6">
                <h3 class="text-base lg:text-xl font-bold">Tolerance</h3>
                <div class="w-full flex flex-row justify-between">
                    <p class="font-light tracking-wide">Threshold of data accuracy</p>
                    <select name="tolerance" v-model="toleranceSettings" class="outline-none text-base lg:text-lg">
                        <option v-for="(e, i) in rangeTolerance" :key="i" :value="e">{{ e }}</option>
                    </select>
                </div>
            </div>

            <div class="w-full mt-4 lg:mt-6">
                <h3 class="text-base lg:text-xl font-bold">Sample Rates</h3>
                <div class="w-full flex flex-row justify-between">
                    <p class="font-light tracking-wide">Number of samples per seconds</p>
                    <select name="tolerance" v-model="sampleSettings" class="outline-none text-base lg:text-lg">
                        <option v-for="(e, i) in rangeSample" :key="i" :value="e">{{ e }}</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps({
    onResults: Function,
})

const emit = defineEmits(['settings'])

const rangeWindow = [30, 40, 50, 60, 70, 80, 90];
const rangeTolerance = [0.01, 0.03, 0.05, 0.07, 0.09, 0.1];
const rangeSample = [10, 20, 30, 40, 50, 60];

const windowSettings = ref<number>(60);
const toleranceSettings = ref<number>(0.03);
const sampleSettings = ref<number>(30);

const windowStyle = computed(() => {
    const percentage = Math.round((windowSettings.value - 30) / 60 * 100);
    return {
        background: `linear-gradient(to right, #172d44 ${percentage}%, #e0e6eb ${percentage}%)`
    }
})

watch([windowSettings, toleranceSettings, sampleSettings], (e) => {
    const settings: SettingsResult = { window: e[0] ?? 60, tolerance: e[1] ?? 0.03, sampleRates: e[2] ?? 30 }
    emit('settings', settings);
    if(props.onResults) props.onResults(settings)
})
</script>