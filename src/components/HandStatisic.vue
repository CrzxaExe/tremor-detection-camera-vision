<template>
    <div class="w-full lg:min-h-[400px] py-3 lg:py-5 px-3 lg:px-4 max-w-220 bg-zinc-200 rounded-lg flex flex-col gap-5">
        <div class="flex flex-row w-full gap-2">
            <apexchart type="line" :series="graphSeries" :options="graphOptions" class="max-w-130 w-full" />
            <div class="flex flex-col gap-2 w-full lg:w-1/3 px-4">
                <h1 class="text-sm lg:text-base font-bold text-[#373d3f] tracking-tight">Output</h1>
                <div class="flex flex-col font-medium">
                    <span class="text-[#0180e1]">Ampitude {{ (amplitude ?? 0).toFixed(2) }}</span>
                    <span class="text-[#02be7f] -mt-2">Frequency {{ (frequency ?? 0).toFixed(2) }}Hz</span>
                </div>

                <div class="flex flex-col">
                    <span>Stddev {{ (stability?.stddev ?? 0).toFixed(2) }}</span>
                    <span>Stability {{ (stability?.stability ?? 0).toFixed(2) }}</span>
                </div>
                <div class="flex flex-col mt-4">
                    <h2 class="text-sm lg:text-base font-semibold">Prediction:</h2>
                    <span>Normal : {{ ((fuzzyResult.confidence.Normal ?? 0) * 100).toFixed(0) }}%</span>
                    <span>Mild :{{ ((fuzzyResult.confidence.Mild ?? 0) * 100).toFixed(0) }}%</span>
                    <span>Severe :{{ ((fuzzyResult.confidence.Severe ?? 0) * 100).toFixed(0) }}%</span>
                    <div class="w-full mt-4">
                        <span class="text-gray-100 text-2xl min-w-70 max-w-70 rounded-lg w-full inline-block bg-rose-500 px 3 lg:px-5 py-1.5 lg:py-3">Tremor: {{ fuzzyResult.label }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full">
            <h1 class="text-sm lg:text-base font-bold tracking-tight">Settings</h1>
            <div class="w-full">
                <h3>Window {{ window }}</h3>
                <div class="flex flex-row gap-2 min-w-70 max-w-80 -mt-1">
                    <span class="text-xs lg:text-sm">30</span>
                    <input type="range" min="30" value="60" max="90" v-model="window" class="bg-sky-500 outline-none w-full rounded-full border-0">
                    <span class="text-xs lg:text-sm">90</span>
                </div>
            </div>

            <div class="flex flex-row gap-2 lg:gap-3 mt-2">
                <div class="flex flex-row gap-2">
                    <label for="tolerance">Tolerance</label>
                    <select name="tolerance" v-model="tolerance" class="px-2 border rounded-md">
                        <option :value="0.01">0.01</option>
                        <option :value="0.03">0.03</option>
                        <option :value="0.05">0.05</option>
                        <option :value="0.07">0.07</option>
                    </select>
                </div>
                <div class="flex flex-row gap-2 pl-2 lg:pl-4 border-l">
                    <label for="sample-rates">Sample Rates</label>
                    <select name="sample-rates" v-model="sampleRate" class="px-2 border rounded-md">
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="30">30</option>
                        <option :value="40">40</option>
                        <option :value="50">50</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inferTremor } from '@/utils/fuzzy';
import { ref, nextTick } from 'vue';
import { Amplitude } from '@/lib/Amplitude';
import { Frequency } from '@/lib/Frequency';
import { Stability } from '@/lib/Stability';

const amplitude = ref<number>(0);
const frequency = ref<number>(0);
const stability = ref({ stddev: 0, stability: 0 });

// parameter
const window = ref<number>(60);
const tolerance = ref<number>(0.03);
const sampleRate = ref<number>(30);

const graphOptions = ref({
    chart: {
        height: '60px',
        width: '100%',
        toolbar: {
            show: false
        },
        stroke: {
            curve: "smooth"
        }
    },
    title: {
        text: 'Graph',
        align: 'left'
    },
    tooltip: {
        x: {
            formater: (e: any) => "Data "+e
        }
    },
    grid: {
        row: {
            colors: ['#fff', 'transparent'],
            opacity: 0.2
        },
    },
    yaxis: {
        show: true,
        showAlways: true,
        decimalsInFloat: 2,
        axisBorder: {
            color: '#000'
        },
    },
    xaxis: {
        axisBorder: {
            color: '#000'
        },
        labels: {
            show: false,
        },
        categories: [],
    }
})
const graphSeries = ref([
    {
        name: "Amplitude",
        data: Amplitude.data
    },
    {
        name: "Frequency",
        data: Frequency.data
    },
])

const fuzzyResult = ref({
    value: 0,
    label: "Yogak",
    confidence: {Normal: 1, Mild: 0, Severe: 0}
})

setInterval(() => {
    // if (Date.now() - lastUpdated.value > 500) {
    //     amplitude.value = 0;
    //     frequency.value = 0;
    //     stability.value = { stability: 1, stddev: 0 };
        
    //     fuzzyResult.value = {
    //         value: 0,
    //         label: "Normal",
    //         confidence: { Normal: 1, Mild: 0, Severe: 0 }
    //     };
    //     return;
    // }

    amplitude.value = (Amplitude.compute(0, { window: window.value }) ?? 0) as number;
    frequency.value = (Frequency.compute(0, { window: window.value, sampleRate: sampleRate.value }) ?? 0) as number;
    stability.value = Stability.compute(0, { window: window.value, tolerance: tolerance.value });
    nextTick();

    fuzzyResult.value = inferTremor(amplitude.value, frequency.value, stability.value.stability);
}, 100)
</script>