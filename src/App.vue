<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import {
  Bus,
  BusFront,
  ExternalLink,
  Info,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  UserRound,
  Volume2,
  X,
} from "lucide-vue-next";

type RideView = {
  id: "boarding" | "driver";
  label: string;
  src: string;
  mode: "boarding-loop" | "full-loop";
};

type SongLink = {
  title: string;
  film: string;
  href: string;
  note?: string;
};

const rideViews: RideView[] = [
  {
    id: "boarding",
    label: "Boarding",
    src: "boarding-bus.mp4",
    mode: "boarding-loop",
  },
  {
    id: "driver",
    label: "Front view",
    src: "driver-bus.mp4",
    mode: "full-loop",
  },
];

const songLinks: SongLink[] = [
  {
    title: "Barsaat Ke Mausam Mein",
    film: "Naajayaz",
    href: "https://www.youtube.com/watch?v=Q_cq8__k--M",
  },
  {
    title: "Tumsa Koi Pyaara",
    film: "Khuddar",
    href: "https://www.youtube.com/watch?v=HubRXgH0Erc",
  },
  {
    title: "Tumhein Apna Banane Ki Kasam",
    film: "Sadak",
    href: "https://www.youtube.com/watch?v=tPNwGuu_rQ4",
  },
  {
    title: "Pehli Pehli Baar Mohabbat Ki Hai",
    film: "Sirf Tum",
    href: "https://www.youtube.com/watch?v=cBGDDBHN22U",
  },
  {
    title: "Saaton Janam Main Tere",
    film: "Dilwale",
    href: "https://www.youtube.com/watch?v=f0oiheLlFW4",
  },
  {
    title: "Pucho Zara Pucho",
    film: "Raja Hindustani",
    href: "https://www.youtube.com/watch?v=E4HtYArLiwc",
  },
  {
    title: "Aisi Deewangi",
    film: "Deewana",
    href: "https://www.youtube.com/watch?v=GwpqME_Cmpc",
  },
  {
    title: "Laal Dupatta",
    film: "Mujhse Shaadi Karogi",
    href: "https://www.youtube.com/watch?v=1jjDs69WWUQ",
  },
  {
    title: "Chori Chori Dil Tera",
    film: "Phool Aur Angaar",
    href: "https://www.youtube.com/watch?v=xXp7NhVKypk",
    note: "Often confused with Phool Aur Kaante",
  },
  {
    title: "Yunhi Chala Chal Rahi",
    film: "Swades",
    href: "https://www.youtube.com/watch?v=eEeX2QMlSlo",
  },
  {
    title: "Aate Jate Khoobsurat Awara",
    film: "Anurodh",
    href: "https://www.youtube.com/watch?v=A0QOP_kRX6Q",
  },
  {
    title: "Neele Neele Ambar Par",
    film: "Kalaakaar",
    href: "https://www.youtube.com/watch?v=eVnG_Rqfgg4",
  },
  {
    title: "Chand Se Parda Kijiye",
    film: "Aao Pyaar Karen",
    href: "https://www.youtube.com/watch?v=P87IAiJmo4A",
  },
];

const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const duration = ref(0);
const isReady = ref(false);
const isStarted = ref(false);
const isPlaying = ref(false);
const isSwitchingView = ref(false);
const isAboutOpen = ref(false);
const isSongsOpen = ref(false);
const volume = ref(78);
const selectedViewId = ref<RideView["id"]>("boarding");

const introStart = computed(() => Math.max(duration.value - 3.5, 0));
const loopStart = computed(() => Math.max(duration.value - 0.7, 0));
const selectedView = computed(() => rideViews.find((view) => view.id === selectedViewId.value) ?? rideViews[0]);
const assetBase = import.meta.env.BASE_URL;

function assetUrl(path: string) {
  return `${assetBase}${path}`;
}

function setVideoStartTime(video: HTMLVideoElement) {
  video.currentTime = selectedView.value.mode === "boarding-loop" ? introStart.value : 0;
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

async function playAudio(audio: HTMLAudioElement, randomizeStart = false) {
  audio.volume = volume.value / 100;
  await waitForAudioMetadata(audio);
  if (randomizeStart) {
    setRandomAudioTime(audio);
  }
  await audio.play();
}

async function onVideoLoaded() {
  const video = videoRef.value;
  if (!video) return;

  duration.value = Number.isFinite(video.duration) ? video.duration : 0;
  setVideoStartTime(video);
  video.muted = true;
  isReady.value = true;

  if (isStarted.value && isPlaying.value) {
    await video.play().catch(() => undefined);
  }
}

async function playMedia(randomizeAudio = false) {
  const video = videoRef.value;
  if (!video) return;

  video.muted = true;
  await video.play();

  const audio = audioRef.value;
  if (audio) {
    try {
      await playAudio(audio, randomizeAudio);
    } catch {
      audio.pause();
    }
  }

  isPlaying.value = true;
}

async function startRide() {
  const video = videoRef.value;
  const audio = audioRef.value;
  if (!video) return;

  isStarted.value = true;
  setVideoStartTime(video);

  if (audio) {
    audio.loop = false;
    audio.volume = volume.value / 100;
  }

  await playMedia(true);
}

async function restartRide() {
  await startRide();
}

async function togglePlayback() {
  const video = videoRef.value;
  const audio = audioRef.value;
  if (!video) return;

  if (video.paused) {
    await playMedia(false);
  } else {
    video.pause();
    audio?.pause();
    isPlaying.value = false;
  }
}

function onVideoTimeUpdate() {
  const video = videoRef.value;
  if (!video || !isStarted.value || duration.value <= 0 || selectedView.value.mode !== "boarding-loop") return;

  if (video.currentTime >= duration.value - 0.05) {
    video.currentTime = loopStart.value;
    void video.play();
  }
}

async function selectView(viewId: RideView["id"]) {
  if (selectedViewId.value === viewId) return;

  const shouldKeepPlaying = isStarted.value && isPlaying.value;
  isSwitchingView.value = true;
  try {
    selectedViewId.value = viewId;
    isReady.value = false;
    duration.value = 0;
    await nextTick();

    const video = videoRef.value;
    if (!video) return;

    video.load();
    if (shouldKeepPlaying) {
      await video.play().catch(() => undefined);
      await audioRef.value?.play().catch(() => undefined);
      isPlaying.value = true;
    }
  } finally {
    isSwitchingView.value = false;
  }
}

function onVideoPlay() {
  if (isStarted.value) {
    isPlaying.value = true;
  }
}

function onVideoPause() {
  if (isStarted.value && !isSwitchingView.value) {
    isPlaying.value = false;
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

  void playAudio(audio, true).catch(() => undefined);
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
        :key="selectedView.id"
        class="ride-video"
        :src="assetUrl(selectedView.src)"
        :loop="selectedView.mode === 'full-loop'"
        playsinline
        preload="auto"
        :poster="assetUrl('bus-reference.png')"
        @loadedmetadata="onVideoLoaded"
        @timeupdate="onVideoTimeUpdate"
        @play="onVideoPlay"
        @pause="onVideoPause"
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
        <div class="top-actions">
          <div class="view-toggle" aria-label="Bus view">
            <button
              v-for="view in rideViews"
              :key="view.id"
              class="view-button"
              :class="{ active: selectedViewId === view.id }"
              type="button"
              :aria-pressed="selectedViewId === view.id"
              @click="selectView(view.id)"
            >
              <UserRound v-if="view.id === 'boarding'" :size="17" />
              <BusFront v-else :size="17" />
              {{ view.label }}
            </button>
            <button class="view-button" type="button" @click="isAboutOpen = true">
              <Info :size="17" />
              About
            </button>
            <button class="view-button" type="button" @click="isSongsOpen = true">
              <ListMusic :size="17" />
              Songs
            </button>
          </div>
          <button
            v-if="isStarted"
            class="icon-button"
            type="button"
            aria-label="Restart ride"
            @click="restartRide"
          >
            <RotateCcw :size="19" />
          </button>
        </div>
      </div>

      <div v-if="isAboutOpen" class="about-overlay" role="dialog" aria-modal="true" aria-labelledby="about-title">
        <section class="about-modal">
          <button class="close-button" type="button" aria-label="Close about" @click="isAboutOpen = false">
            <X :size="20" />
          </button>
          <p class="eyebrow">About</p>
          <h2 id="about-title">Indian Bus Bangers</h2>
          <p class="about-copy">
            Github:
            <a href="https://github.com/hubshashwat/indianbusbangers" target="_blank" rel="noreferrer">
              github.com/hubshashwat
              <ExternalLink :size="15" />
            </a>
          </p>
          <p class="about-copy">I miss travelling in buses, ngl.</p>
        </section>
      </div>

      <div v-if="isSongsOpen" class="about-overlay" role="dialog" aria-modal="true" aria-labelledby="songs-title">
        <section class="about-modal songs-modal">
          <button class="close-button" type="button" aria-label="Close songs" @click="isSongsOpen = false">
            <X :size="20" />
          </button>
          <p class="eyebrow">Playlist links</p>
          <h2 id="songs-title">Ultimate Bus Bangers</h2>
          <div class="song-list">
            <a
              v-for="song in songLinks"
              :key="song.href"
              class="song-link"
              :href="song.href"
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <strong>{{ song.title }}</strong>
                <small>{{ song.film }}<template v-if="song.note"> · {{ song.note }}</template></small>
              </span>
              <ExternalLink :size="16" />
            </a>
          </div>
        </section>
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
