<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import {
  Bus,
  Headphones,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-vue-next";

type RiderId = "guy" | "girl";
type Stage = "select" | "boarding" | "seated";

type Rider = {
  id: RiderId;
  label: string;
  detail: string;
  jacket: string;
  accent: string;
  hair: string;
};

type Song = {
  title: string;
  artist: string;
  mood: string;
  color: string;
  query: string;
  beat: number[];
};

const riders: Rider[] = [
  {
    id: "guy",
    label: "Guy",
    detail: "Black jacket, main-character aisle walk",
    jacket: "#22252d",
    accent: "#f3b64f",
    hair: "#141414",
  },
  {
    id: "girl",
    label: "Girl",
    detail: "Magenta kurta, window-seat entrance",
    jacket: "#b33a6c",
    accent: "#38a169",
    hair: "#151313",
  },
];

const songs: Song[] = [
  {
    title: "Kala Chashma",
    artist: "Amar Arshi, Badshah, Neha Kakkar",
    mood: "Wedding bus",
    color: "#f6c453",
    query: "Kala Chashma song",
    beat: [220, 330, 247, 392],
  },
  {
    title: "Naatu Naatu",
    artist: "Rahul Sipligunj, Kaala Bhairava",
    mood: "Footwork mode",
    color: "#ec5d49",
    query: "Naatu Naatu song",
    beat: [196, 294, 392, 294],
  },
  {
    title: "Jhoome Jo Pathaan",
    artist: "Arijit Singh, Sukriti Kakar",
    mood: "Window swagger",
    color: "#4fb3ff",
    query: "Jhoome Jo Pathaan song",
    beat: [262, 330, 392, 523],
  },
  {
    title: "Chaiyya Chaiyya",
    artist: "Sukhwinder Singh, Sapna Awasthi",
    mood: "Classic route",
    color: "#2fb47c",
    query: "Chaiyya Chaiyya song",
    beat: [196, 262, 330, 392],
  },
  {
    title: "Malhari",
    artist: "Vishal Dadlani",
    mood: "Victory lap",
    color: "#d8495b",
    query: "Malhari song",
    beat: [147, 220, 294, 349],
  },
  {
    title: "Gallan Goodiyaan",
    artist: "Yashita Sharma, Manish Kumar Tipu",
    mood: "Group chorus",
    color: "#f28d35",
    query: "Gallan Goodiyaan song",
    beat: [247, 330, 370, 494],
  },
];

const selectedRider = ref<Rider | null>(null);
const stage = ref<Stage>("select");
const selectedSong = ref(songs[0]);
const isPlaying = ref(false);
const volume = ref(72);
const boardingProgress = ref(0);

let boardingTimer: number | undefined;
let progressTimer: number | undefined;
let audioContext: AudioContext | null = null;
let beatTimer: number | undefined;
let beatIndex = 0;

const selectedRiderClass = computed(() =>
  selectedRider.value?.id === "girl" ? "rider-girl" : "rider-guy",
);

const riderStyle = computed(() => ({
  "--jacket": selectedRider.value?.jacket ?? riders[0].jacket,
  "--accent": selectedRider.value?.accent ?? riders[0].accent,
  "--hair": selectedRider.value?.hair ?? riders[0].hair,
}));

const songLink = computed(
  () =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      selectedSong.value.query,
    )}`,
);

function startBoarding(rider: Rider) {
  stopAudio();
  selectedRider.value = rider;
  stage.value = "boarding";
  boardingProgress.value = 0;
  window.clearTimeout(boardingTimer);
  window.clearInterval(progressTimer);

  progressTimer = window.setInterval(() => {
    boardingProgress.value = Math.min(boardingProgress.value + 4, 100);
  }, 120);

  boardingTimer = window.setTimeout(() => {
    stage.value = "seated";
    boardingProgress.value = 100;
    window.clearInterval(progressTimer);
  }, 3200);
}

function resetRide() {
  stage.value = "select";
  selectedRider.value = null;
  boardingProgress.value = 0;
  stopAudio();
}

function chooseSong(song: Song) {
  selectedSong.value = song;
  if (isPlaying.value) {
    stopAudio(false);
    startAudio();
  }
}

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
}

function playPulse() {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const frequency =
    selectedSong.value.beat[beatIndex % selectedSong.value.beat.length];

  oscillator.type = beatIndex % 4 === 0 ? "sawtooth" : "triangle";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.13);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(volume.value / 450, 0.03),
    now + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.18);
  beatIndex += 1;
}

function startAudio() {
  ensureAudioContext();
  isPlaying.value = true;
  window.clearInterval(beatTimer);
  playPulse();
  beatTimer = window.setInterval(playPulse, 285);
}

function stopAudio(markStopped = true) {
  window.clearInterval(beatTimer);
  beatTimer = undefined;
  if (markStopped) isPlaying.value = false;
}

function toggleAudio() {
  if (isPlaying.value) {
    stopAudio();
  } else {
    startAudio();
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(boardingTimer);
  window.clearInterval(progressTimer);
  stopAudio();
  void audioContext?.close();
});
</script>

<template>
  <main class="app-shell" :class="[`stage-${stage}`, selectedRiderClass]">
    <section class="bus-stage" aria-label="Animated bus music scene">
      <div class="reference-glow" aria-hidden="true"></div>
      <div class="city-strip" aria-hidden="true">
        <span v-for="index in 9" :key="index"></span>
      </div>

      <div class="top-bar">
        <div class="brand-lockup">
          <span class="brand-mark"><Bus :size="22" /></span>
          <div>
            <p>Bus Bangers</p>
            <strong>Indian songs, full volume ride</strong>
          </div>
        </div>
        <button
          v-if="stage !== 'select'"
          class="icon-button"
          type="button"
          aria-label="Start over"
          @click="resetRide"
        >
          <RotateCcw :size="19" />
        </button>
      </div>

      <div class="bus-window" aria-hidden="true">
        <div class="rail rail-left"></div>
        <div class="rail rail-right"></div>
        <div class="handle-row handle-left">
          <span v-for="index in 4" :key="`l-${index}`"></span>
        </div>
        <div class="handle-row handle-right">
          <span v-for="index in 4" :key="`r-${index}`"></span>
        </div>
        <div class="aisle-light"></div>
        <div class="seat-grid left">
          <span v-for="index in 8" :key="`left-${index}`"></span>
        </div>
        <div class="seat-grid right">
          <span v-for="index in 8" :key="`right-${index}`"></span>
        </div>
        <div class="passenger-cloud">
          <span v-for="index in 22" :key="index"></span>
        </div>
        <div class="entry-doors"></div>
        <div
          v-if="selectedRider"
          class="rider"
          :class="{ walking: stage === 'boarding', seated: stage === 'seated' }"
          :style="riderStyle"
        >
          <span class="head"></span>
          <span class="hair"></span>
          <span class="torso"></span>
          <span class="arm arm-left"></span>
          <span class="arm arm-right"></span>
          <span class="leg leg-left"></span>
          <span class="leg leg-right"></span>
        </div>
      </div>

      <div v-if="stage === 'select'" class="selection-panel">
        <p class="eyebrow"><Sparkles :size="16" /> Route ready</p>
        <h1>Pick your rider before the bass drops.</h1>
        <div class="rider-options">
          <button
            v-for="rider in riders"
            :key="rider.id"
            class="rider-card"
            type="button"
            @click="startBoarding(rider)"
          >
            <span
              class="mini-person"
              :style="{
                '--jacket': rider.jacket,
                '--accent': rider.accent,
                '--hair': rider.hair,
              }"
            >
              <span></span>
            </span>
            <strong>{{ rider.label }}</strong>
            <small>{{ rider.detail }}</small>
          </button>
        </div>
      </div>

      <div v-if="stage === 'boarding'" class="boarding-panel">
        <p>{{ selectedRider?.label }} is boarding</p>
        <div class="progress-track">
          <span :style="{ width: `${boardingProgress}%` }"></span>
        </div>
      </div>

      <section v-if="stage === 'seated'" class="music-console" aria-label="Song menu">
        <div class="player-card" :style="{ '--song-color': selectedSong.color }">
          <div>
            <p class="eyebrow"><Headphones :size="16" /> Now seated</p>
            <h2>{{ selectedSong.title }}</h2>
            <p>{{ selectedSong.artist }}</p>
          </div>
          <button
            class="play-button"
            type="button"
            :aria-label="isPlaying ? 'Pause preview beat' : 'Play preview beat'"
            @click="toggleAudio"
          >
            <Pause v-if="isPlaying" :size="24" />
            <Play v-else :size="24" />
          </button>
        </div>

        <div class="equalizer" :class="{ active: isPlaying }" aria-hidden="true">
          <span v-for="index in 18" :key="index"></span>
        </div>

        <div class="volume-row">
          <Volume2 :size="18" />
          <input v-model="volume" type="range" min="10" max="100" aria-label="Volume" />
          <a :href="songLink" target="_blank" rel="noreferrer">Open track</a>
        </div>

        <div class="song-list">
          <button
            v-for="song in songs"
            :key="song.title"
            class="song-row"
            :class="{ active: selectedSong.title === song.title }"
            :style="{ '--song-color': song.color }"
            type="button"
            @click="chooseSong(song)"
          >
            <span class="song-icon"><Music2 :size="17" /></span>
            <span>
              <strong>{{ song.title }}</strong>
              <small>{{ song.mood }}</small>
            </span>
          </button>
        </div>
      </section>
    </section>
  </main>
</template>
