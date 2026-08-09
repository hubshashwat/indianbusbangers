<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { Bus, Pause, Play, RotateCcw, Volume2 } from "lucide-vue-next";

const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const duration = ref(0);
const isReady = ref(false);
const isStarted = ref(false);
const isPlaying = ref(false);
const volume = ref(78);

const introStart = computed(() => Math.max(duration.value - 3.5, 0));
const loopStart = computed(() => Math.max(duration.value - 0.7, 0));
const assetBase = import.meta.env.BASE_URL;

function assetUrl(path: string) {
  return `${assetBase}${path}`;
}

function setRandomAudioTime(audio: HTMLAudioElement) {
  if (Number.isFinite(audio.duration) && audio.duration > 1) {
    audio.currentTime = Math.random() * Math.max(audio.duration - 1, 0);
  }
}

async function waitForAudioMetadata(audio: HTMLAudioElement) {
  if (Number.isFinite(audio.duration) && audio.duration > 0) return;

  await new Promise<void>((resolve) => {
    const finish = () => resolve();
    audio.addEventListener("loadedmetadata", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.load();
  });
}

async function playAudioFromRandomTime(audio: HTMLAudioElement) {
  audio.volume = volume.value / 100;
  await waitForAudioMetadata(audio);
  setRandomAudioTime(audio);
  await audio.play();
}

function onVideoLoaded() {
  const video = videoRef.value;
  if (!video) return;

  duration.value = Number.isFinite(video.duration) ? video.duration : 0;
  video.currentTime = introStart.value;
  video.muted = true;
  isReady.value = true;
}

async function playMedia() {
  const video = videoRef.value;
  if (!video) return;

  video.muted = true;
  await video.play();
  isPlaying.value = true;

  const audio = audioRef.value;
  if (audio) {
    try {
      await playAudioFromRandomTime(audio);
    } catch {
      return;
    }
  }
}

async function startRide() {
  const video = videoRef.value;
  const audio = audioRef.value;
  if (!video) return;

  isStarted.value = true;
  video.currentTime = introStart.value;

  if (audio) {
    audio.loop = false;
    audio.volume = volume.value / 100;
  }

  await playMedia();
}

async function restartRide() {
  await startRide();
}

async function togglePlayback() {
  const video = videoRef.value;
  const audio = audioRef.value;
  if (!video) return;

  if (video.paused) {
    await playMedia();
  } else {
    video.pause();
    audio?.pause();
    isPlaying.value = false;
  }
}

function onVideoTimeUpdate() {
  const video = videoRef.value;
  if (!video || !isStarted.value || duration.value <= 0) return;

  if (video.currentTime >= duration.value - 0.05) {
    video.currentTime = loopStart.value;
    void video.play();
  }
}

function onVolumeInput() {
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100;
  }
}

function onAudioEnded() {
  const audio = audioRef.value;
  if (!audio) return;

  void playAudioFromRandomTime(audio).catch(() => undefined);
}

onBeforeUnmount(() => {
  videoRef.value?.pause();
  audioRef.value?.pause();
});
</script>

<template>
  <main class="app-shell">
    <section class="video-stage" aria-label="Bus banger video player">
      <video
        ref="videoRef"
        class="ride-video"
        :src="assetUrl('boarding-bus.mp4')"
        playsinline
        preload="auto"
        :poster="assetUrl('bus-reference.png')"
        @loadedmetadata="onVideoLoaded"
        @timeupdate="onVideoTimeUpdate"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></video>

      <audio
        ref="audioRef"
        :src="assetUrl('bus-bangers.mp3')"
        preload="auto"
        @ended="onAudioEnded"
      ></audio>

      <div class="video-scrim"></div>

      <div class="top-bar">
        <div class="brand-lockup">
          <span class="brand-mark"><Bus :size="22" /></span>
          <div>
            <p>NOW PLAYING</p>
            <strong>Indian Bus Bangers</strong>
          </div>
        </div>
        <button
          v-if="isStarted"
          class="icon-button"
          type="button"
          aria-label="Restart last four seconds"
          @click="restartRide"
        >
          <RotateCcw :size="19" />
        </button>
      </div>

      <section v-if="!isStarted" class="start-panel">
        <p class="eyebrow">Now boarding</p>
        <h1>Indian Bus Bangers</h1>
        <button class="start-button" type="button" :disabled="!isReady" @click="startRide">
          <Play :size="22" />
          Start ride
        </button>
      </section>

      <section v-else class="player-dock" aria-label="Ride controls">
        <button class="play-button" type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePlayback">
          <Pause v-if="isPlaying" :size="24" />
          <Play v-else :size="24" />
        </button>

        <div class="volume-row">
          <Volume2 :size="18" />
          <input v-model="volume" type="range" min="0" max="100" aria-label="Volume" @input="onVolumeInput" />
        </div>
      </section>
    </section>
  </main>
</template>
