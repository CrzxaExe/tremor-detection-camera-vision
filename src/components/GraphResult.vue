<template>
    <div class="col-span-2 lg:row-span-2 text-black">
        <h1 class="font-bold text-xl lg:text-2xl">Output</h1>
        
        <div class="flex flex-col-reverse lg:flex-row-reverse lg:items-start gap-6 lg:gap-8 -mt-1">
            <div class="w-full flex flex-col">
                <h2 class="font-light tracking-wide text-base: lg:text-lg">Graph</h2>
                <div class="flex flex-col lg:flex-row -mt-1 gap-2">
                    <apexchart type="line" :series="AmpFreqSeries" :options="AmpFreqOptions" class="lg:max-w-74 aspect-20/6 w-full" />
                    <apexchart type="line" :series="StabilitySeries" :options="AmpFreqOptions" class="lg:max-w-74 aspect-20/6 w-full" />
                </div>
            </div>
            <div class="flex flex-col">
                <h2 class="font-light tracking-wide text-base lg:text-lg">Data</h2>
                <div class="flex flex-row gap-3 lg:gap-6 mt-2 lg:mt-4">
                    <div class="flex flex-col lg:gap-2">
                        <span class="text-light tracking-tight">Amplitudo</span>
                        <span class="text-light tracking-tight">Frequency</span>
                        <span class="text-light tracking-tight">Stddev</span>
                        <span class="text-light tracking-tight">Stability</span>
                    </div>
                    <div class="flex flex-col lg:gap-2">
                        <span>{{ amp.toFixed(2) }}</span>
                        <span>{{ freq.toFixed(2) }}Hz</span>
                        <span>{{ (stability.stddev * 100).toFixed(0) }}%</span>
                        <span>{{ (stability.stability * 100).toFixed(0) }}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Amplitude } from '@/lib/Amplitude';
import { Frequency } from '@/lib/Frequency';
import { Stability } from '@/lib/Stability';
import { computed, reactive } from 'vue';

const props = defineProps({
    amplitude: { type: Number, default: 0 },
    frequency: { type: Number, default: 0 },
    stability: { type: Object, default: { stddev: 0, stability: 0} },
});

const amp = computed(() => props.amplitude);
const freq = computed(() => props.frequency);
const stability = computed(() => props.stability);

const AmpFreqSeries = reactive([
    {
        name: "Amplitude",
        data: Amplitude.data
    },
    {
        name: "Frequncy",
        data: Frequency.data
    }
])
const StabilitySeries = reactive([
    {
        name: "Stability",
        data: Stability.data,
    },
    {
        name: "Stddev",
        data: Stability.stddevs,
    },
])

const AmpFreqOptions = reactive({
    chart: {
        height: 'auto',
        width: '100%',
        toolbar: {
            show: false
        },
    },
    colors: [
        '#172d44',
        '#3a6ea5'
    ],
    stroke: {
        curve: "smooth",
        width: 3,
        lineCap: 'butt',
    },
    grid: {
        yaxis: {
            lines: {
                show: true
            }
        },
    },
    title: {
        align: 'left'
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
        stepSize: 12,
        axisBorder: {
            color: '#000'
        },
        labels: {
            show: false,
        },
        categories: [],
    }
})
</script>