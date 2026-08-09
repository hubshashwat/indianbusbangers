# Bus Bangers

An open-source Vue/Vite UI app for playing Indian bus bangers over the supplied animated bus boarding video.

## What It Does

- Uses the actual bus boarding MP4 as the full-screen experience.
- Starts playback from the final 3.5 seconds of the clip.
- Loops the final 0.7 seconds while background music plays.
- Supports a bundled `public/bus-banger.mp3` file or an in-browser MP3 picker.
- Keeps the UI lightweight: start, restart, play/pause, volume, and MP3 selection.

## Commands

```bash
pnpm run dev
pnpm run build
```

## Media

- Video: `public/boarding-bus.mp4`
- Optional default audio: add `public/bus-banger.mp3`

## License

MIT
