import { create } from "zustand";
import * as Tone from "tone";

interface PianoState {
  startKey: number;
  visibleKeys: number;
  activeKeys: Set<number>;
  piano: Tone.Sampler | null;
  isLoading: boolean;
  isPlayingDemo: boolean;
  suggestedKeys: number[];
  setStartKey: (key: number) => void;
  pressKey: (key: number) => void;
  releaseKey: (key: number) => void;
  initAudio: () => Promise<void>;
  playDemo: () => void;
  stopDemo: () => void;
  setSuggestedKeys: (keys: number[]) => void;
}

export const usePianoStore = create<PianoState>((set, get) => ({
  startKey: 36, // Middle C (C4) is key 39 in C-based mapping
  visibleKeys: 13,
  activeKeys: new Set(),
  piano: null,
  isLoading: false, // Start as false, only true during initAudio
  isPlayingDemo: false,
  suggestedKeys: [],

  setStartKey: (key) => {
    const maxStart = 88 - get().visibleKeys;
    const validKey = Math.max(0, Math.min(key, maxStart));
    set({ startKey: validKey });
  },

  pressKey: (key) => {
    const { piano, activeKeys, isLoading } = get();
    if (!piano || isLoading) return;

    const newActiveKeys = new Set(activeKeys);
    newActiveKeys.add(key);
    set({ activeKeys: newActiveKeys });

    const note = keyToNote(key);
    piano.triggerAttack(note);
  },

  releaseKey: (key) => {
    const { piano, activeKeys, isLoading } = get();
    if (!piano || isLoading) return;

    const newActiveKeys = new Set(activeKeys);
    newActiveKeys.delete(key);
    set({ activeKeys: newActiveKeys });

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
          A1: "A1.mp3",
          A2: "A2.mp3",
          A3: "A3.mp3",
          A4: "A4.mp3",
          A5: "A5.mp3",
          A6: "A6.mp3",
          C1: "C1.mp3",
          C2: "C2.mp3",
          C3: "C3.mp3",
          C4: "C4.mp3",
          C5: "C5.mp3",
          C6: "C6.mp3",
          C7: "C7.mp3",
          "D#1": "Ds1.mp3",
          "D#2": "Ds2.mp3",
          "D#3": "Ds3.mp3",
          "D#4": "Ds4.mp3",
          "D#5": "Ds5.mp3",
          "F#1": "Fs1.mp3",
          "F#2": "Fs2.mp3",
          "F#3": "Fs3.mp3",
          "F#4": "Fs4.mp3",
          "F#5": "Fs5.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          console.log("✅ Piano samples loaded successfully");
          set({
            isLoading: false,
            piano,
            suggestedKeys: [39, 41, 43, 44, 46, 48, 50, 51], // C major scale from C4
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

  playDemo: () => {
    const { piano, isLoading } = get();
    if (!piano || isLoading || get().isPlayingDemo) return;

    set({ isPlayingDemo: true });

    const furEliseNotes = [
      { note: "E5", time: "0:0", duration: "8n" },
      { note: "D#5", time: "0:0.5", duration: "8n" },
      { note: "E5", time: "0:1", duration: "8n" },
      { note: "D#5", time: "0:1.5", duration: "8n" },
      { note: "E5", time: "0:2", duration: "8n" },
      { note: "B4", time: "0:2.5", duration: "8n" },
      { note: "D5", time: "0:3", duration: "8n" },
      { note: "C5", time: "0:3.5", duration: "8n" },
      { note: "A4", time: "0:4", duration: "4n" },
      { note: "C4", time: "0:5", duration: "8n" },
      { note: "E4", time: "0:5.5", duration: "8n" },
      { note: "A4", time: "0:6", duration: "8n" },
      { note: "B4", time: "0:6.5", duration: "8n" },
      { note: "E4", time: "0:7", duration: "8n" },
      { note: "G#4", time: "0:7.5", duration: "8n" },
      { note: "B4", time: "0:8", duration: "8n" },
      { note: "C5", time: "0:8.5", duration: "8n" },
      { note: "E5", time: "0:9", duration: "8n" },
      { note: "D#5", time: "0:9.5", duration: "8n" },
      { note: "E5", time: "0:10", duration: "8n" },
      { note: "D#5", time: "0:10.5", duration: "8n" },
      { note: "E5", time: "0:11", duration: "8n" },
      { note: "B4", time: "0:11.5", duration: "8n" },
      { note: "D5", time: "0:12", duration: "8n" },
      { note: "C5", time: "0:12.5", duration: "8n" },
      { note: "A4", time: "0:13", duration: "4n" },
    ];

    const part = new Tone.Part((time, note) => {
      const keyIndex = noteToKey(note.note);
      if (keyIndex !== -1) {
        piano.triggerAttackRelease(note.note, note.duration, time);
        get().pressKey(keyIndex);
        Tone.Transport.schedule(() => {
          get().releaseKey(keyIndex);
        }, time + Tone.Time(note.duration).toSeconds());
      }
    }, furEliseNotes).start(0);

    Tone.Transport.bpm.value = 80;
    Tone.Transport.start();

    Tone.Transport.schedule(() => {
      part.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
      set({ isPlayingDemo: false, activeKeys: new Set() });
    }, "0:14");
  },

  stopDemo: () => {
    if (!get().isPlayingDemo) return;

    Tone.Transport.stop();
    Tone.Transport.cancel();
    set({ activeKeys: new Set(), isPlayingDemo: false });
  },

  setSuggestedKeys: (keys) => {
    set({ suggestedKeys: keys });
  },
}));

export function keyToNote(key: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(key / 12) + 1; // C-based mapping
  const noteIndex = key % 12;
  return `${notes[noteIndex]}${octave}`;
}

export function noteToKey(note: string): number {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteName = note.slice(0, -1);
  const octave = Number.parseInt(note.slice(-1));
  const noteIndex = notes.indexOf(noteName);
  if (noteIndex === -1) return -1;
  return (octave - 1) * 12 + noteIndex;
}