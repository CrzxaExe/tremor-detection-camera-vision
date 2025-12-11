<template>
  <div class="w-full max-w-220 relative overflow-hidden rounded-lg">
    <div class="absolute z-20 top-2 left-2 flex gap-2">
      <button @click="overlayVisible = !overlayVisible" class="px-3 py-1 bg-white/80 rounded">{{ !overlayVisible ?  "Enable Overlay" : "Disable Overlay" }}</button>
      <button @click="detecting = !detecting" class="px-3 py-1 bg-white/80 rounded">
        <PauseIcon v-if="!detecting" class="stroke-black aspect-square w-8" />
        <PlayIcon v-else class="stroke-black aspect-square w-8" />
      </button>
    </div>

    <div class="w-full max-w-[640px] max-h-[400px] min-h-[400px] block bg-black overflow-hidden  ">
      <video ref="videoEl" autoplay playsinline muted class="w-full" :style="{ display: overlayVisible ? 'none' : 'block' }"></video>
      <canvas ref="canvasEl" class="w-full" :style="{ display: overlayVisible ? 'block' : 'none' }"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands'
import PlayIcon from './icons/PlayIcon.vue'
import PauseIcon from './icons/PauseIcon.vue'

const props = defineProps({
  onResults: Function,
  initialOverlay: { type: Boolean, default: true }
})
const emit = defineEmits(['results'])

const videoEl = ref(null)
const canvasEl = ref(null)
let stream = null
let hands = null
let rafId = null

const overlayVisible = ref(props.initialOverlay)
const detecting = ref(true)

// Function to draw hand landmark
function drawResults(results) {
  const canvas = canvasEl.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  canvas.width = videoEl.value.videoWidth || 640
  canvas.height = videoEl.value.videoHeight || 400

  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

  const drawPoint = (x, y, r = 4, color = '#ff0066') => {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x * canvas.width, y * canvas.height, r, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawLine = (a, b, color = '#00ff88') => {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.moveTo(a.x * canvas.width, a.y * canvas.height)
    ctx.lineTo(b.x * canvas.width, b.y * canvas.height)
    ctx.stroke()
  }

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      for (const connection of HAND_CONNECTIONS) {
        const a = landmarks[connection[0]]
        const b = landmarks[connection[1]]
        if (a && b) drawLine(a, b)
      }
      for (const lm of landmarks) drawPoint(lm.x, lm.y, 4)
    }
  }
  ctx.restore()
}

async function startHands() {
  // Ger hand model from mediapipe-hands cdn 
  hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5
  })

  hands.onResults((results) => {
    // draw only when overlay is visible
    if (overlayVisible.value) drawResults(results)
    
    // if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    //     // Ambil data tangan pertama (index 0) dan simpan
    //     storeLandmark(results.multiHandLandmarks[0]);
    // }

    // emit and call callback for further processing
    emit('results', results)
    if (props.onResults) props.onResults(results)
  })

  // Capture user camera
  stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 400 }, audio: false })
  videoEl.value.srcObject = stream
  await videoEl.value.play()

  async function sendFrame() {
    if (!videoEl.value || videoEl.value.readyState < 2) {
      rafId = requestAnimationFrame(sendFrame)
      return
    }
    if (detecting.value) {
      try { await hands.send({ image: videoEl.value }) } catch (e) {}
    }
    rafId = requestAnimationFrame(sendFrame)
  }
  sendFrame()
}

onMounted(() => startHands().catch((err) => console.error('HandTracker start error', err)))

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
  if (hands) { try { hands.close && hands.close() } catch (e) {} hands = null }
})

// keep canvas/video sizes in sync when overlay toggles
watch(overlayVisible, (v) => {
  if (!v) return
  // redraw a frame quickly when overlay re-enabled
  if (videoEl.value && hands) hands.send({ image: videoEl.value }).catch(() => {})
})
</script>
