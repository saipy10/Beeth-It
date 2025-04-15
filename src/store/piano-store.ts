// src/store/piano-store.ts
import { create } from "zustand";
import * as Tone from "tone";

interface SongNote {
  midi: number;
  duration: number;
  time: number;
}

interface Song {
  name: string;
  notes: SongNote[];
  range: { min: number; max: number };
}

interface PianoState {
  startKey: number;
  visibleKeys: number;
  activeKeys: Set<number>;
  piano: Tone.Sampler | null;
  isLoading: boolean;
  isPlayingDemo: boolean;
  suggestedKeys: number[];
  currentSong: Song | null;
  songProgress: number;
  velocity: Map<number, number>; // Add velocity map to track key velocity
  setStartKey: (key: number) => void;
  setVisibleKeys: (count: number) => void;
  pressKey: (key: number, vel?: number) => void; // Update to accept velocity
  releaseKey: (key: number) => void;
  initAudio: () => Promise<void>;
  playSong: (song: Song) => void;
  stopSong: () => void;
  setSuggestedKeys: (keys: number[]) => void;
}

export const usePianoStore = create<PianoState>((set, get) => ({
  startKey: 60, // C4
  visibleKeys: 13,
  activeKeys: new Set(),
  piano: null,
  isLoading: false,
  isPlayingDemo: false,
  suggestedKeys: [],
  currentSong: null,
  songProgress: 0,
  velocity: new Map(), // Initialize velocity map

  setStartKey: (key) => {
    const maxStart = 87 - get().visibleKeys + 1;
    const validKey = Math.max(0, Math.min(key, maxStart));
    set({ startKey: validKey });
  },

  setVisibleKeys: (count) => {
    const newCount = Math.max(1, Math.min(18, count));
    const maxStart = 87 - newCount + 1;
    const newStartKey = Math.min(get().startKey, maxStart);
    set({ visibleKeys: newCount, startKey: newStartKey });
  },

  pressKey: (key, vel = 0.7) => {
    const { piano, activeKeys, isLoading, velocity } = get();
    if (!piano || isLoading) return;

    if (key < get().startKey || key >= get().startKey + get().visibleKeys) return;

    const newActiveKeys = new Set(activeKeys);
    newActiveKeys.add(key);
    
    // Store the velocity for this key
    const newVelocity = new Map(velocity);
    newVelocity.set(key, vel);
    
    set({ 
      activeKeys: newActiveKeys,
      velocity: newVelocity
    });

    const note = keyToNote(key);
    // Use velocity in triggering the note
    piano.triggerAttack(note, Tone.now(), vel);
  },

  releaseKey: (key) => {
    const { piano, activeKeys, isLoading, velocity } = get();
    if (!piano || isLoading) return;

    const newActiveKeys = new Set(activeKeys);
    newActiveKeys.delete(key);
    
    // Clean up velocity data for released key
    const newVelocity = new Map(velocity);
    // Keep velocity in map for animation purposes
    // Will be removed when animation is complete
    
    set({ 
      activeKeys: newActiveKeys,
      velocity: newVelocity
    });

    const note = keyToNote(key);
    piano.triggerRelease(note);
  },

  initAudio: async () => {
    console.log("Starting initAudio...");
    set({ isLoading: true });

    try {
      console.log("Attempting to start audio context");
      await Tone.start();
      console.log("Audio context started");

      const reverb = new Tone.Reverb({
        decay: 2,
        wet: 0.3,
      }).toDestination();
      console.log("Generating reverb...");
      await reverb.generate();
      console.log("Reverb generated");

      const piano = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          console.log("✅ Piano samples loaded successfully");
          set({
            isLoading: false,
            piano,
            suggestedKeys: [60, 62, 64, 65, 67, 69, 71, 72], // C major scale
          });
        },
        onerror: (err) => {
          console.error("❌ Failed to load samples:", err);
          set({ isLoading: false, piano: null });
        },
      }).connect(reverb);

      console.log("Sampler created, loading samples...");
      piano.volume.value = -5;
    } catch (error) {
      console.error("❌ Failed to initialize audio:", error);
      set({ isLoading: false, piano: null });
    }
  },

  playSong: (song: Song) => {
    const { piano, isLoading } = get();
    if (!piano || isLoading || get().isPlayingDemo) return;

    set({ isPlayingDemo: true, currentSong: song, songProgress: 0, activeKeys: new Set() });

    // Set visible keys and center range
    const rangeSize = song.range.max - song.range.min + 1;
    const visible = Math.min(Math.max(rangeSize, 7), 18);
    get().setVisibleKeys(visible);
    const centerKey = Math.floor((song.range.min + song.range.max) / 2);
    get().setStartKey(centerKey - Math.floor(visible / 2));

    const startTime = performance.now();
    let noteIndex = 0;

    const update = () => {
      const elapsed = performance.now() - startTime;
      const totalTime = song.notes[song.notes.length - 1].time + song.notes[song.notes.length - 1].duration;
      set({ songProgress: elapsed / totalTime });

      // Play notes
      while (noteIndex < song.notes.length && song.notes[noteIndex].time <= elapsed) {
        const note = song.notes[noteIndex];
        get().pressKey(note.midi);
        setTimeout(() => {
          get().releaseKey(note.midi);
        }, note.duration);
        noteIndex++;
      }

      // Auto-scroll
      const currentNotes = song.notes.filter(
        (n) => n.time <= elapsed && n.time + n.duration >= elapsed
      );
      if (currentNotes.length > 0) {
        const minNote = Math.min(...currentNotes.map((n) => n.midi));
        const maxNote = Math.max(...currentNotes.map((n) => n.midi));
        const center = Math.floor((minNote + maxNote) / 2);
        const currentStart = get().startKey;
        const visible = get().visibleKeys;
        if (center < currentStart + 2 || center > currentStart + visible - 3) {
          get().setStartKey(center - Math.floor(visible / 2));
        }
      }

      if (elapsed < totalTime) {
        requestAnimationFrame(update);
      } else {
        get().stopSong();
      }
    };
    requestAnimationFrame(update);
  },

  stopSong: () => {
    if (!get().isPlayingDemo) return;
    set({ isPlayingDemo: false, activeKeys: new Set(), songProgress: 0, currentSong: null });
  },

  setSuggestedKeys: (keys) => {
    set({ suggestedKeys: keys });
  },
}));

export function keyToNote(key: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(key / 12) - 1;
  const noteIndex = key % 12;
  return `${notes[noteIndex]}${octave}`;
}

export function noteToKey(note: string): number {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteName = note.slice(0, -1);
  const octave = Number.parseInt(note.slice(-1));
  const noteIndex = notes.indexOf(noteName);
  if (noteIndex === -1) return -1;
  return (octave + 1) * 12 + noteIndex;
}