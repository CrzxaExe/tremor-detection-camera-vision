<template>
    <div class="row-span-5 w-full">
        <div class="block w-full">
            <h2 class="font-light tracking-wide text-base: lg:text-lg">Result</h2>
            <h1 class="font-bold text-xl lg:text-2xl -mt-1">Prediction</h1>

            <apexchart type="donut" :series :options />
        </div>

        <div class="mt-6 lg:mt-16 flex flex-col justify-center items-center relative">
            <h2 class="font-semibold tracking-wide text-base: lg:text-lg">Dominant Prediction</h2>

            <div class="relative w-full aspect-video">
                <div class="w-full min-h-full absolute flex justify-center items-center">
                    <span class="rounded-2xl text-xl lg:text-2xl bg-white/50 border-2 shadow-lg shadow-black/23 border-white backdrop-blur-5xl inline px-3 lg:px-6 py-1 lg:py-1.5">{{ tremor.toUpperCase() }}</span>
                </div>
                <img src="https://raw.githubusercontent.com/YoorySink/YoorySink/main/Video_Tangan_Berputar_Derajat%20(1)%20(1)%20(1).gif" alt="Tangan Muter Muter" class="select-none mix-blend-color-burn grayscale-100 opacity-9s0">
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    model: { type: Object, default: {
        Mild: 1,
        Normal: 1,
        Severe: 1,
        label: 'Normal'
    }}
})
const labels = ['Mild', 'Normal', 'Severe'];
const series = computed(() => [ props.model.Mild, props.model.Normal, props.model.Severe ]);
const tremor = computed(() => props.model.label);
const options = computed(() => ({
    labels,
    dataLabels: {
        enable: false,
        enableOnSeries: false
    },
    colors: ['#94a3b8', '#3a6ea5', '#c08497'],
    plotOptions: {
      pie: {
        customScale: 0.8,
        donut: {
          size: '0',
          labels: {
            show: false,
          }
        }
      }
    },
    legend: {
        position: "bottom",
        formater: (e) => "Test"+e,
        clusterGroupedSeries: true,
        clusterGroupedSeriesOrientation: 'vertikal',
    }
}))
</script>