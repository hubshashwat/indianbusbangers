import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig({
  base: "./",
  root: "app",
  publicDir: "../public",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
  },
  server: isCodexSeatbeltSandbox
    ? { watch: { useFsEvents: false, usePolling: true } }
    : undefined,
  plugins: [vue()],
});
