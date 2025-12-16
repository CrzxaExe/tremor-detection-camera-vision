<script setup lang="ts">
import { contributors, webTech } from '@/constant/web';

</script>

<template>
  <main class="w-full">
    <div class="w-full min-h-screen lg:max-h-screen px-4 lg:px-0 py-2 lg:py-10 pt-32 lg:pt-32 flex flex-col items-center overflow-x-hidden font-dashboard font-normal">
      <section class="w-full max-w-300">
        <h1 class="text-2xl lg:text-4xl font-bold tracking-tighter">What is this project?</h1>
        <p class="text-sm lg:text-lg tracking-wide text-justify mt-4">
          This a web app to analyze hand tremor by using camera vision from user webcam to capture and process your hand movement into structured data that is used fuzzy logic to predict tremor by several rules. It use webcam your to capture image and send it to mediapipe that will handle the image to get hand landmark that are 21 point as Vector3 to be calculated and displayed to your interface.
        </p>
      </section>

      <section class="w-full max-w-300 mt-4 lg:mt-8">
        <h1 class="text-2xl lg:text-4xl font-bold tracking-tighter">Why create this project?</h1>
        <p class="text-sm lg:text-lg tracking-wide text-justify mt-4">
          Hand tremors are involuntary movements that require accurate monitoring because they affect daily activities. This study developed a video-based tremor detection system using pose estimation and fuzzy logic as a non-invasive and practical solution.
        </p>
      </section>

      <section class="w-full max-w-300 mt-4 lg:mt-8">
        <h1 class="text-2xl lg:text-4xl font-bold tracking-tighter">Technology on this project</h1>
        <p class="text-sm lg:text-lg tracking-wide text-justify mt-4">
          We are on modern ages, it will easier us to create this project by using framework and library that exists to do complex task that we cannot handle it by ourselves. So we pick some this techstack to help us for somethings.
        </p>

        <ul class="mt-2 lg:mt-4 flex flex-col gap-2 lg:gap-4">
          <li v-for="({ name, description, version}, i) in webTech" :key="i" class="pb-2">
            <h2 class="text-lg lg:text-xl font-semibold">{{ name }}</h2>
            <span class="text-xs lg:text-sm -mt-2">v{{ version }}</span>

            <p>{{ description }}</p>
          </li>
        </ul>
      </section>

      <section class="w-full max-w-300 mt-4 lg:mt-8">
        <h1 class="text-2xl lg:text-4xl font-bold tracking-tighter">Contributors Behind This Project</h1>
        <p class="text-sm lg:text-lg tracking-wide text-justify mt-4">
          This project are created by our team with each member id and role are below of this paragraph. Each member have difference role to focus on, but they still help others member to do some jobs for clearing the task faster.
        </p>

        <ul class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mt-4 gap-2 lg:gap-4">
          <li v-for="({ github, id, jobs, name, profileUrl }, i) in contributors" :key="i" class="flex flex-row w-fit gap-2">
            <a :href="github" target="_blank">
              <img :src="profileUrl" :alt="name" class="max-w-18 rounded-lg w-full">
            </a>
            <div class="px-2 flex flex-col">
              <h2 class="text-base lg:text-lg font-semibold inline"><a :href="github" target="_blank">{{ name }}</a></h2>
              <h3 class="text-xs lg:text-sm font-light -mt-1 lg:-mt-2">{{ id }}</h3>

              <p class="mt-1">{{ jobs.join(", ") }}</p>
            </div>
          </li>
        </ul>

        <span class="block w-full text-center py-4 lg:py-8">@2025</span>
      </section>
    </div>
  </main>
</template>
