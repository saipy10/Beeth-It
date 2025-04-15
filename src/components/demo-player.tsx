// "use client";

// import { JSX, useEffect, useRef, useState } from "react";
// import { usePianoStore } from "@/store/piano-store";
// import { Midi } from "@tonejs/midi";
// import * as Tone from "tone";

// // Define interface for note data structure
// interface NoteData {
//   name: string;
//   time: number;
//   duration: number;
//   velocity: number;
// }

// // Define interface for song data structure expected by piano store
// interface SongData {
//   name: string;
//   author: string;
//   range: {
//     min: number;
//     max: number;
//   };
//   notes: NoteData[]; // Added notes array for the song
// }

// export default function DemoPlayer(): JSX.Element {
//   const {
//     isPlayingDemo,
//     playSong,
//     stopSong,
//     initAudio,
//     isLoading,
//     piano
//   } = usePianoStore();
  
//   const [midiLoaded, setMidiLoaded] = useState<boolean>(false);
//   const [loadError, setLoadError] = useState<boolean>(false);
//   const midiRef = useRef<Midi | null>(null);
//   const scheduledEventsRef = useRef<number[]>([]);
  
//   // Initialize audio on component mount
//   useEffect(() => {
//     if (!piano && !isLoading) {
//       initAudio();
//     }
    
//     // Clean up on unmount
//     return () => {
//       if (isPlayingDemo) {
//         stopSong();
//       }
//       clearAllScheduledEvents();
//     };
//   }, [piano, isLoading, initAudio, stopSong, isPlayingDemo]);
  
//   // Load MIDI file when piano is ready
//   useEffect(() => {
//     if (!midiLoaded && piano && !loadError) {
//       fetchMidi();
//     }
//   }, [piano, midiLoaded, loadError]);
  
//   const fetchMidi = async (): Promise<void> => {
//     try {
//       const res = await fetch("/midi/for_elise_by_beethoven.mid");
//       if (!res.ok) {
//         throw new Error(`Failed to fetch MIDI file: ${res.statusText}`);
//       }
      
//       const arrayBuffer = await res.arrayBuffer();
//       const midi = new Midi(arrayBuffer);
//       midiRef.current = midi;
//       setMidiLoaded(true);
//       setLoadError(false);
//     } catch (error) {
//       console.error("Error loading MIDI file:", error);
//       setLoadError(true);
//       setMidiLoaded(false);
//     }
//   };
  
//   const clearAllScheduledEvents = (): void => {
//     // Clear all scheduled timeouts
//     scheduledEventsRef.current.forEach(id => window.clearTimeout(id));
//     scheduledEventsRef.current = [];
    
//     // Cancel all scheduled Tone.js events
//     Tone.Transport.cancel();
//   };
  
//   const extractNotesFromMidi = (): NoteData[] => {
//     if (!midiRef.current) return [];
    
//     const allNotes: NoteData[] = [];
    
//     // Extract all notes from all tracks
//     midiRef.current.tracks.forEach((track) => {
//       if (track.notes && track.notes.length > 0) {
//         track.notes.forEach((note) => {
//           // Create a simplified note object with only the properties we need
//           allNotes.push({
//             name: note.name,
//             time: note.time,
//             duration: note.duration,
//             velocity: note.velocity
//           });
//         });
//       }
//     });
    
//     // Sort notes by time for proper playback and progress tracking
//     allNotes.sort((a, b) => a.time - b.time);
    
//     return allNotes;
//   };
  
//   const scheduleMidi = (notes: NoteData[]): void => {
//     if (!piano || notes.length === 0) return;
    
//     // Ensure Tone.js transport is started
//     if (Tone.Transport.state !== "started") {
//       Tone.Transport.start();
//     }
    
//     // Reset transport position and clear previous events
//     Tone.Transport.position = 0;
//     clearAllScheduledEvents();
    
//     const now = Tone.now();
//     const startTime = now + 0.1; // Small buffer for scheduling
    
//     // Schedule all notes for playback
//     notes.forEach((note) => {
//       const noteStartTime = startTime + note.time;
      
//       // Play the note using piano sampler
//       piano.triggerAttackRelease(
//         note.name,
//         note.duration,
//         noteStartTime,
//         note.velocity
//       );
//     });
    
//     // Calculate total song duration from last note
//     if (notes.length > 0) {
//       const lastNote = notes[notes.length - 1];
//       const songDuration = lastNote.time + lastNote.duration;
      
//       // Schedule automatic stop at the end of the song
//       const stopTimeoutId = window.setTimeout(() => {
//         stopSong();
//         clearAllScheduledEvents();
//       }, (songDuration * 1000) + 500); // Add a small buffer
      
//       scheduledEventsRef.current.push(stopTimeoutId);
//     }
//   };
  
//   const getKeyRange = (notes: NoteData[]): { min: number; max: number } => {
//     if (notes.length === 0) {
//       // Default range for Für Elise if no notes available
//       return { min: 40, max: 84 }; // E2 to C6
//     }
    
//     let minNote = 127; // MIDI max value
//     let maxNote = 0;   // MIDI min value
    
//     notes.forEach(note => {
//       const midiNumber = Tone.Frequency(note.name).toMidi();
//       minNote = Math.min(minNote, midiNumber);
//       maxNote = Math.max(maxNote, midiNumber);
//     });
    
//     return { min: minNote, max: maxNote };
//   };
  
//   const handlePlayPause = async (): Promise<void> => {
//     try {
//       // Ensure Tone.js context is started (needed for user interaction)
//       await Tone.start();
      
//       if (isPlayingDemo) {
//         stopSong();
//         clearAllScheduledEvents();
//       } else {
//         if (!midiLoaded) {
//           await fetchMidi();
//         }
        
//         // Extract notes from MIDI file
//         const notes = extractNotesFromMidi();
        
//         if (notes.length === 0) {
//           console.error("No notes found in MIDI file");
//           setLoadError(true);
//           return;
//         }
        
//         // Get key range from notes
//         const range = getKeyRange(notes);
        
//         // Create song data with all required properties
//         const songData: SongData = { 
//           name: "Für Elise", 
//           author: "Beethoven",
//           range: range,
//           notes: notes
//         };
        
//         // Start playback
//         playSong(songData);
//         scheduleMidi(notes);
//       }
//     } catch (error) {
//       console.error("Error playing/pausing:", error);
//       // If there was an error starting playback, reset the state
//       stopSong();
//       clearAllScheduledEvents();
//     }
//   };
  
//   return (
//     <div className="w-full max-w-6xl mx-auto mb-4">
//       <button
//         onClick={handlePlayPause}
//         disabled={isLoading || (!piano && !isPlayingDemo) || loadError}
//         className={`flex items-center justify-center px-6 py-3 font-medium text-white rounded-lg transition-all duration-200 shadow-lg ${  
//           isLoading || (!piano && !isPlayingDemo) || loadError
//             ? "bg-gray-600/50 cursor-not-allowed opacity-50"
//             : isPlayingDemo
//             ? "bg-indigo-600 hover:bg-indigo-500"
//             : "bg-indigo-800 hover:bg-indigo-700 hover:scale-105 active:scale-95"
//         }`}
//         aria-label={isPlayingDemo ? "Stop playing Für Elise" : "Play Für Elise"}
//       >
//         <span className="mr-2 text-lg">{isPlayingDemo ? "❚❚" : "▶"}</span>
//         {isPlayingDemo ? "Stop" : "Play"} Für Elise
//       </button>
      
//       {loadError && (
//         <div className="mt-2 text-red-500 text-center">
//           Failed to load MIDI file. Please check that "/midi/for_elise_by_beethoven.mid" exists.
//         </div>
//       )}
//     </div>
//   );
// }