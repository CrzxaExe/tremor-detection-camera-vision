<template>
    <div class="w-full lg:min-h-[400px] py-3 lg:py-5 px-3 lg:px-4 max-w-220 bg-zinc-200 rounded-lg flex flex-col gap-5">
        <div class="flex flex-row w-full gap-2">
            <apexchart type="line" :series="graphSeries" :options="graphOptions" class="max-h-[50px] max-w-150 w-full" />
            <div class="flex flex-col gap-2 w-full lg:w-1/3">
                <h1 class="text-lg lg:text-xl font-extrabold text-[#373d3f] tracking-tight">Output</h1>
                <div class="flex flex-col font-medium">
                    <span class="text-[#0180e1]">Ampitude {{ (amplitude ?? 0).toFixed(2) }}</span>
                    <span class="text-[#02be7f]">Frequency {{ (frequency ?? 0).toFixed(2) }}Hz</span>
                </div>

                <div class="flex flex-col">
                    <span>Stddev {{ (stability?.stddev ?? 0).toFixed(2) }}</span>
                    <span>Stability {{ (stability?.stability ?? 0).toFixed(2) }}</span>
                </div>
                <div class="flex flex-col border-t pt-2 mt-2">
                    <h2 class="text-lg lg:text-xl font-semibold">Prediction:</h2>
                    <span>Normal : {{ ((fuzzyResult.confidence.Normal ?? 0) * 100).toFixed(0) }}%</span>
                    <span>Mild :{{ ((fuzzyResult.confidence.Mild ?? 0) * 100).toFixed(0) }}%</span>
                    <span>Severe :{{ ((fuzzyResult.confidence.Severe ?? 0) * 100).toFixed(0) }}%</span>
                </div>
            </div>
        </div>
        <div class="bg-rose-500 p-5">
            <span class="text-gray-100 text-2xl">Tremor: {{ fuzzyResult.label }}</span>
        </div>
    </div>
</template>

<script setup>
import { amplitudes, computeAmplitude, computeFrequency, computeStability, frequencies } from '@/utils/landmarkVariable';
import { inferTremor } from '@/utils/fuzzy';
import { ref } from 'vue';

const amplitude = ref(0);
const frequency = ref(0);
const stability = ref({ stddev: 0, stability: 0 });

const graphOptions = ref({
    chart: {
        height: '50px',
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
            formater: e => "Data "+e
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
        data: amplitudes
    },
    {
        name: "Frequency",
        data: frequencies
    },
])

const fuzzyResult = ref({
    value: 0,
    label: "Yogak",
    confidence: {Normal: 1, Mild: 0, Severe: 0}
})

setInterval(() => {
    amplitude.value = computeAmplitude(0, { window: 60 });
    frequency.value = computeFrequency(0, { window: 120, sampleRate: 30 });
    stability.value = computeStability(0, { window: 60, tolerance: 0.03 });

    fuzzyResult.value = inferTremor(amplitude.value, frequency.value, stability.value.stability);
}, 100)
</script>