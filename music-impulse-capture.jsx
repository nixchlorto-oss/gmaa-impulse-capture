import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

const IMPULSE_TAGS = [
  { id: "romantic", label: "Feels Romantic", emoji: "💜", color: "from-pink-500 to-purple-600", bg: "bg-pink-500/20", border: "border-pink-400/50", glow: "shadow-pink-500/40" },
  { id: "energetic", label: "Energetic", emoji: "⚡", color: "from-yellow-400 to-orange-500", bg: "bg-orange-500/20", border: "border-orange-400/50", glow: "shadow-orange-500/40" },
  { id: "bass", label: "Love That Bass", emoji: "🔊", color: "from-cyan-400 to-blue-600", bg: "bg-cyan-500/20", border: "border-cyan-400/50", glow: "shadow-cyan-500/40" },
  { id: "vocal", label: "This Vocal", emoji: "🎤", color: "from-emerald-400 to-teal-600", bg: "bg-emerald-500/20", border: "border-emerald-400/50", glow: "shadow-emerald-500/40" },
  { id: "drop", label: "That Drop!", emoji: "💥", color: "from-red-500 to-rose-600", bg: "bg-red-500/20", border: "border-red-400/50", glow: "shadow-red-500/40" },
  { id: "melody", label: "Sweet Melody", emoji: "🎵", color: "from-violet-400 to-indigo-600", bg: "bg-violet-500/20", border: "border-violet-400/50", glow: "shadow-violet-500/40" },
  { id: "vibe", label: "The Vibe", emoji: "🌊", color: "from-sky-400 to-blue-500", bg: "bg-sky-500/20", border: "border-sky-400/50", glow: "shadow-sky-500/40" },
  { id: "groove", label: "Sick Groove", emoji: "🕺", color: "from-amber-400 to-yellow-500", bg: "bg-amber-500/20", border: "border-amber-400/50", glow: "shadow-amber-500/40" },
];

const DEMO_SONG = { title: "Abracadabra", artist: "Lady Gaga", album: "Mayhem", duration: 64 };

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ── Audio engine ──────────────────────────────────────────────
function useMusicEngine() {
  const partsRef = useRef({});
  const startedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const init = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    await Tone.start();

    // Master
    const vol = new Tone.Volume(-6).toDestination();
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).connect(vol);
    const delay = new Tone.FeedbackDelay("8n", 0.2).connect(vol);
    delay.wet.value = 0.15;

    // Kick
    const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 } }).connect(vol);
    kick.volume.value = 2;

    // Snare / clap
    const noise = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 } }).connect(vol);
    noise.volume.value = -4;

    // Hi-hat
    const hat = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.06, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).connect(vol);
    hat.volume.value = -14;

    // Bass
    const bass = new Tone.MonoSynth({ oscillator: { type: "sawtooth" }, filter: { Q: 4, type: "lowpass", rolloff: -24 }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 }, filterEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.3, baseFrequency: 80, octaves: 2.5 } }).connect(vol);
    bass.volume.value = -2;

    // Lead synth
    const lead = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle8" }, envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 } }).connect(reverb).connect(delay);
    lead.volume.value = -8;

    // Pad
    const pad = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 0.8, decay: 1, sustain: 0.6, release: 2 } }).connect(reverb);
    pad.volume.value = -12;

    // ── Patterns ──
    Tone.Transport.bpm.value = 120;

    // Kick: four-on-the-floor
    const kickPart = new Tone.Loop((time) => { kick.triggerAttackRelease("C1", "8n", time); }, "4n").start(0);

    // Snare on 2 & 4
    const snarePart = new Tone.Loop((time) => { noise.triggerAttackRelease("8n", time); }, "2n").start("4n");

    // Hi-hats 8ths
    const hatPart = new Tone.Loop((time) => { hat.triggerAttackRelease("32n", time, 0.3 + Math.random() * 0.15); }, "8n").start(0);

    // Bass line
    const bassNotes = [
      { time: "0:0", note: "C2", dur: "4n" },
      { time: "0:1", note: "C2", dur: "8n" },
      { time: "0:1:2", note: "Eb2", dur: "8n" },
      { time: "0:2", note: "F2", dur: "4n" },
      { time: "0:3", note: "G2", dur: "8n" },
      { time: "0:3:2", note: "Eb2", dur: "8n" },
      { time: "1:0", note: "Ab2", dur: "4n" },
      { time: "1:1", note: "G2", dur: "8n" },
      { time: "1:1:2", note: "F2", dur: "8n" },
      { time: "1:2", note: "Eb2", dur: "4n" },
      { time: "1:3", note: "D2", dur: "4n" },
    ];
    const bassPart = new Tone.Part((time, val) => { bass.triggerAttackRelease(val.note, val.dur, time); }, bassNotes).start(0);
    bassPart.loop = true;
    bassPart.loopEnd = "2m";

    // Lead melody
    const melodyNotes = [
      { time: "0:0", note: "C5", dur: "8n" },
      { time: "0:0:2", note: "Eb5", dur: "8n" },
      { time: "0:1", note: "G5", dur: "4n" },
      { time: "0:2", note: "F5", dur: "8n" },
      { time: "0:2:2", note: "Eb5", dur: "8n" },
      { time: "0:3", note: "D5", dur: "4n" },
      { time: "1:0", note: "Eb5", dur: "4n" },
      { time: "1:1", note: "C5", dur: "4n" },
      { time: "1:2", note: "Ab4", dur: "4n." },
      { time: "1:3:2", note: "Bb4", dur: "8n" },
    ];
    const melodyPart = new Tone.Part((time, val) => { lead.triggerAttackRelease(val.note, val.dur, time); }, melodyNotes).start("4m");
    melodyPart.loop = true;
    melodyPart.loopEnd = "2m";

    // Pad chords
    const padChords = [
      { time: "0:0", notes: ["C4", "Eb4", "G4"], dur: "1m" },
      { time: "1:0", notes: ["Ab3", "C4", "Eb4"], dur: "1m" },
    ];
    const padPart = new Tone.Part((time, val) => { pad.triggerAttackRelease(val.notes, val.dur, time); }, padChords).start(0);
    padPart.loop = true;
    padPart.loopEnd = "2m";

    partsRef.current = { kick, noise, hat, bass, lead, pad, kickPart, snarePart, hatPart, bassPart, melodyPart, padPart, vol };
    setIsReady(true);
  }, []);

  const play = useCallback(() => { if (isReady) Tone.Transport.start(); }, [isReady]);
  const pause = useCallback(() => { Tone.Transport.pause(); }, []);
  const getTime = useCallback(() => Tone.Transport.seconds, []);
  const getAnalysis = useCallback(() => {
    // Simple heuristic based on transport position to simulate "AI detection"
    const beat = Tone.Transport.position.split(":").map(Number);
    const bar = beat[0] % 8;
    if (bar < 4) return ["bass", "groove"];
    return ["melody", "vocal"];
  }, []);

  return { init, play, pause, getTime, getAnalysis, isReady };
}

// ── Components ────────────────────────────────────────────────
function WaveformBar({ index, active, intensity }) {
  const h = 8 + Math.sin(index * 0.7 + intensity * 3) * 20 + Math.random() * (active ? 16 : 4);
  return (
    <div
      className="rounded-full transition-all duration-100"
      style={{
        width: 3,
        height: `${Math.max(4, h)}px`,
        background: active ? "linear-gradient(to top, #06b6d4, #a855f7, #ec4899)" : "rgba(255,255,255,0.12)",
        boxShadow: active ? "0 0 4px rgba(168,85,247,0.4)" : "none",
      }}
    />
  );
}

function ImpulseTag({ tag, aiSuggested, onCapture }) {
  const [flash, setFlash] = useState(false);
  const click = () => {
    setFlash(true);
    onCapture(tag);
    setTimeout(() => setFlash(false), 900);
  };
  return (
    <button
      onClick={click}
      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all duration-300 ${tag.bg} ${tag.border} ${flash ? `scale-110 shadow-lg ${tag.glow}` : "hover:scale-105 active:scale-95"} ${aiSuggested ? "ring-2 ring-white/30" : ""}`}
    >
      {aiSuggested && (
        <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-white/20 backdrop-blur rounded-full px-1.5 py-0.5 text-white/90 font-bold border border-white/20">AI</span>
      )}
      <span className="text-base">{tag.emoji}</span>
      <span className="text-white text-xs font-semibold whitespace-nowrap">{tag.label}</span>
      {flash && <span className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse pointer-events-none" />}
    </button>
  );
}

function CapturedMoment({ moment }) {
  const tag = IMPULSE_TAGS.find((t) => t.id === moment.tagId);
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${tag.bg} border ${tag.border}`}>
      <span>{tag.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-medium">{tag.label}</div>
        <div className="text-white/40 text-[10px]">{formatTime(moment.timestamp)}</div>
      </div>
      <div className="w-10 h-4 flex items-center gap-px">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-full" style={{ height: `${3 + Math.random() * 10}px`, background: "rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function MusicImpulseCapture() {
  const music = useMusicEngine();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [capturedMoments, setCapturedMoments] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(["bass", "groove"]);
  const [waveIntensity, setWaveIntensity] = useState(0);
  const [captureMode, setCaptureMode] = useState(false); // true = tags visible after pressing big button
  const [captureTimestamp, setCaptureTimestamp] = useState(0);
  const [pulseAnim, setPulseAnim] = useState(false);
  const [bigButtonHeld, setBigButtonHeld] = useState(false);

  // Tick
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentTime(music.getTime());
      setWaveIntensity(Math.random());
      setAiSuggestions(music.getAnalysis());
    }, 200);
    return () => clearInterval(id);
  }, [isPlaying, music]);

  const handlePlayPause = async () => {
    if (!music.isReady) await music.init();
    if (isPlaying) {
      music.pause();
      setIsPlaying(false);
    } else {
      music.play();
      setIsPlaying(true);
    }
  };

  // Big capture button
  const handleCapturePress = () => {
    if (!isPlaying) return;
    setPulseAnim(true);
    setBigButtonHeld(true);
    setCaptureTimestamp(currentTime);
    setCaptureMode(true);
    setTimeout(() => { setPulseAnim(false); setBigButtonHeld(false); }, 600);
  };

  // Tag selection after capture
  const handleTagSelect = (tag) => {
    const moment = { id: Date.now(), tagId: tag.id, timestamp: captureTimestamp, song: DEMO_SONG };
    setCapturedMoments((prev) => [moment, ...prev].slice(0, 30));
    setCaptureMode(false);
  };

  const progress = Math.min((currentTime / DEMO_SONG.duration) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" style={{ maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl" />
        <div className="absolute bottom-20 right-0 w-72 h-72 rounded-full bg-cyan-900/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-pink-900/10 blur-3xl" />
      </div>

      {/* Status bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-1 text-xs text-white/50">
        <span>9:41</span>
        <span className="flex gap-1 items-center"><span>5G</span><span>🔋</span></span>
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 py-2 flex items-center justify-between">
        <div className="text-white/40 text-sm">← Back</div>
        <div className="text-sm font-semibold text-white/80 tracking-wide uppercase">Impulse Capture</div>
        <div className="text-white/40 text-sm">{capturedMoments.length} saved</div>
      </div>

      {/* Album art */}
      <div className="relative z-10 flex flex-col items-center px-5 py-3">
        <div className="relative">
          {/* Pulse rings on capture */}
          {pulseAnim && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-40 h-40 rounded-full border-2 border-purple-400/60 animate-ping" />
                <div className="absolute w-48 h-48 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDelay: "0.2s" }} />
              </div>
            </>
          )}
          <div
            className="w-36 h-36 rounded-3xl bg-gradient-to-br from-purple-700 via-pink-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-900/50"
            style={{ transform: isPlaying ? `rotate(${currentTime * 3}deg)` : "none", transition: "transform 0.2s linear" }}
          >
            <div className="w-14 h-14 rounded-full bg-gray-950/80 border-2 border-white/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-base font-bold">{DEMO_SONG.title}</div>
          <div className="text-white/50 text-xs">{DEMO_SONG.artist} — {DEMO_SONG.album}</div>
        </div>
      </div>

      {/* Waveform */}
      <div className="relative z-10 px-5 py-1">
        <div className="flex items-center justify-center gap-px h-10">
          {Array.from({ length: 55 }).map((_, i) => (
            <WaveformBar key={i} index={i} active={i < (progress / 100) * 55} intensity={waveIntensity} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-0.5 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(DEMO_SONG.duration)}</span>
        </div>
        {/* Impulse markers on timeline */}
        <div className="relative h-1.5 mt-0.5">
          {capturedMoments.map((m) => {
            const tag = IMPULSE_TAGS.find((t) => t.id === m.tagId);
            return (
              <div
                key={m.id}
                className="absolute top-0 w-1.5 h-1.5 rounded-full -translate-x-1/2"
                style={{ left: `${(m.timestamp / DEMO_SONG.duration) * 100}%`, background: tag.id === "romantic" ? "#ec4899" : tag.id === "bass" ? "#06b6d4" : tag.id === "drop" ? "#ef4444" : "#a855f7", boxShadow: "0 0 5px currentColor" }}
              />
            );
          })}
        </div>
      </div>

      {/* Playback controls + CAPTURE BUTTON */}
      <div className="relative z-10 flex items-center justify-center gap-6 py-3">
        <button className="text-white/40 text-lg">⏮</button>
        <button onClick={handlePlayPause} className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-all">
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* BIG CAPTURE BUTTON */}
        <button
          onClick={handleCapturePress}
          disabled={!isPlaying}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
            isPlaying
              ? bigButtonHeld
                ? "bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 scale-110 shadow-xl shadow-purple-500/50"
                : "bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
              : "bg-white/10 opacity-40 cursor-not-allowed"
          }`}
        >
          {/* Inner ring */}
          <div className={`absolute inset-1 rounded-full border-2 ${isPlaying ? "border-white/40" : "border-white/10"}`} />
          {/* Record dot */}
          <div className={`w-5 h-5 rounded-full ${isPlaying ? "bg-white" : "bg-white/30"} ${isPlaying && !captureMode ? "animate-pulse" : ""}`} />
          {/* Outer glow when playing */}
          {isPlaying && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-md -z-10 animate-pulse" />
          )}
        </button>

        <button onClick={handlePlayPause} className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-all">
          ⏭
        </button>
        <div /> {/* spacer */}
      </div>

      {/* Capture label */}
      {isPlaying && !captureMode && (
        <div className="relative z-10 text-center -mt-1 mb-1">
          <span className="text-[10px] text-purple-300/70 uppercase tracking-widest">Tap to capture moment</span>
        </div>
      )}

      {/* ── TAG SELECTION (appears after pressing capture) ── */}
      {captureMode && (
        <div className="relative z-10 px-4 py-3 mx-4 mb-2 rounded-2xl bg-white/5 border border-purple-500/30 backdrop-blur">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-200/90 font-medium">What hit you at {formatTime(captureTimestamp)}?</span>
            <button onClick={() => setCaptureMode(false)} className="ml-auto text-white/30 text-xs hover:text-white/60">✕</button>
          </div>
          {/* AI suggestion note */}
          <div className="text-[10px] text-white/30 mb-2 ml-1">AI thinks: {aiSuggestions.map(s => IMPULSE_TAGS.find(t=>t.id===s)?.label).join(", ")}</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {IMPULSE_TAGS.map((tag) => (
              <ImpulseTag key={tag.id} tag={tag} aiSuggested={aiSuggestions.includes(tag.id)} onCapture={handleTagSelect} />
            ))}
          </div>
        </div>
      )}

      {/* ── Captured Moments Feed ── */}
      <div className="relative z-10 flex-1 px-4 pb-6">
        {capturedMoments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Captured Impulses</span>
              <span className="text-[10px] text-cyan-400/60">{capturedMoments.length} moments</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {capturedMoments.slice(0, 6).map((m) => (
                <CapturedMoment key={m.id} moment={m} />
              ))}
            </div>
          </div>
        )}

        {/* Taste DNA */}
        {capturedMoments.length >= 3 && (
          <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-white/40 mb-1.5 uppercase tracking-wider">Your Taste DNA</div>
            <div className="flex gap-1 h-8 items-end">
              {IMPULSE_TAGS.map((tag) => {
                const count = capturedMoments.filter((m) => m.tagId === tag.id).length;
                const pct = (count / capturedMoments.length) * 100;
                return (
                  <div key={tag.id} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={`w-full rounded-t bg-gradient-to-t ${tag.color} transition-all duration-500`} style={{ height: `${Math.max(2, pct * 0.6)}px` }} />
                    <span className="text-[10px]">{tag.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
