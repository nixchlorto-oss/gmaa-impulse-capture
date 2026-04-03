# GMAA Music Impulse Capture

**Mark the moments you love in songs to build your AI music taste profile.**

Part of the [Global AI Music Award (GMAA)](https://github.com/nixchlorto-oss/gmaa-impulse-capture) platform.

## What Is This?

Music Impulse Capture lets you bookmark moments in songs that hit different — a bass drop, a vocal run, a vibe shift. Over time, your captured impulses build a **Taste DNA** profile that feeds personalized AI music generation.

## How It Works

1. **Listen** — Play any music near your device (uses microphone input)
2. **Capture** — Tap the capture button when something hits you
3. **Tag** — Choose from AI-suggested emotion tags based on real-time audio spectrum analysis
4. **Build** — Your Taste DNA profile grows with every captured impulse

## Emotion Tags

| Tag | What It Captures |
|-----|-----------------|
| Feels Romantic | Warm, emotional moments |
| Energetic | High-energy sections |
| Love That Bass | Bass-heavy drops |
| This Vocal | Standout vocal moments |
| That Drop! | Beat drops and transitions |
| Sweet Melody | Melodic highlights |
| The Vibe | Overall mood/atmosphere |
| Sick Groove | Rhythm and groove sections |

## Files

- `music-impulse-capture.html` — **Primary prototype** — Real mic input via Web Audio API, spectrum-based AI tag suggestions, hold-to-capture UX
- `music-impulse-capture.jsx` — Earlier React/Tone.js prototype (superseded by HTML version)

## Tech Stack

- **Web Audio API** — Microphone input, AnalyserNode, frequency data
- **Audio Spectrum Analysis** — Bass/mid/high energy extraction for AI suggestions
- **Vanilla HTML/JS** — Zero dependencies, runs in any modern browser

## Try It

1. Open `music-impulse-capture.html` in a browser
2. Allow microphone access
3. Play music on any device nearby
4. Hit the capture button when something hits you

## License

MIT
