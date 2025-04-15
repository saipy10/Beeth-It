interface SongNote {
    midi: number;
    duration: number; // ms
    time: number; // ms from start
  }
  
  interface Song {
    name: string;
    notes: SongNote[];
    range: { min: number; max: number };
  }
  
  // Für Elise (With proper notes and timing)
  const furElise: Song = {
    name: "Für Elise",
    notes: [
      // First section - main theme
      // E – D# – E – D# – E – B – D – C – A
      { midi: 76, duration: 400, time: 0 },      // E5
      { midi: 75, duration: 400, time: 400 },    // D#5
      { midi: 76, duration: 400, time: 800 },    // E5
      { midi: 75, duration: 400, time: 1200 },   // D#5
      { midi: 76, duration: 400, time: 1600 },   // E5
      { midi: 71, duration: 400, time: 2000 },   // B4
      { midi: 74, duration: 400, time: 2400 },   // D5
      { midi: 72, duration: 400, time: 2800 },   // C5
      { midi: 69, duration: 800, time: 3200 },   // A4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 3200 },   // A2 (bass)
      { midi: 52, duration: 800, time: 3200 },   // E3
      { midi: 57, duration: 800, time: 3200 },   // A3
      
      // C – E – A – B – E – G# – B – C
      { midi: 60, duration: 400, time: 4000 },   // C4
      { midi: 64, duration: 400, time: 4400 },   // E4
      { midi: 69, duration: 400, time: 4800 },   // A4
      { midi: 71, duration: 800, time: 5200 },   // B4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 40, duration: 800, time: 5200 },   // E2 (bass)
      { midi: 47, duration: 800, time: 5200 },   // B2
      { midi: 52, duration: 800, time: 5200 },   // E3
      
      { midi: 64, duration: 400, time: 6000 },   // E4
      { midi: 68, duration: 400, time: 6400 },   // G#4
      { midi: 71, duration: 400, time: 6800 },   // B4
      { midi: 72, duration: 800, time: 7200 },   // C5 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 7200 },   // A2 (bass)
      { midi: 52, duration: 800, time: 7200 },   // E3
      { midi: 57, duration: 800, time: 7200 },   // A3
      
      // Repeat of first theme
      // E – D# – E – D# – E – B – D – C – A
      { midi: 76, duration: 400, time: 8000 },   // E5
      { midi: 75, duration: 400, time: 8400 },   // D#5
      { midi: 76, duration: 400, time: 8800 },   // E5
      { midi: 75, duration: 400, time: 9200 },   // D#5
      { midi: 76, duration: 400, time: 9600 },   // E5
      { midi: 71, duration: 400, time: 10000 },  // B4
      { midi: 74, duration: 400, time: 10400 },  // D5
      { midi: 72, duration: 400, time: 10800 },  // C5
      { midi: 69, duration: 800, time: 11200 },  // A4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 11200 },  // A2 (bass)
      { midi: 52, duration: 800, time: 11200 },  // E3
      { midi: 57, duration: 800, time: 11200 },  // A3
      
      // C – E – A – B – E – C – B – A
      { midi: 60, duration: 400, time: 12000 },  // C4
      { midi: 64, duration: 400, time: 12400 },  // E4
      { midi: 69, duration: 400, time: 12800 },  // A4
      { midi: 71, duration: 800, time: 13200 },  // B4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 40, duration: 800, time: 13200 },  // E2 (bass)
      { midi: 47, duration: 800, time: 13200 },  // B2
      { midi: 52, duration: 800, time: 13200 },  // E3
      
      { midi: 64, duration: 400, time: 14000 },  // E4
      { midi: 72, duration: 400, time: 14400 },  // C5
      { midi: 71, duration: 400, time: 14800 },  // B4
      { midi: 69, duration: 800, time: 15200 },  // A4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 15200 },  // A2 (bass)
      { midi: 52, duration: 800, time: 15200 },  // E3
      { midi: 57, duration: 800, time: 15200 },  // A3
      
      // Middle section (development)
      // B – C – D – E – G – F – E – D
      { midi: 71, duration: 400, time: 16000 },  // B4
      { midi: 72, duration: 400, time: 16400 },  // C5
      { midi: 74, duration: 400, time: 16800 },  // D5
      { midi: 76, duration: 400, time: 17200 },  // E5
      { midi: 79, duration: 400, time: 17600 },  // G5
      { midi: 77, duration: 400, time: 18000 },  // F5
      { midi: 76, duration: 400, time: 18400 },  // E5
      { midi: 74, duration: 400, time: 18800 },  // D5
      
      // Left hand accompaniment for middle section
      { midi: 43, duration: 1600, time: 16000 }, // G2 (bass)
      { midi: 50, duration: 1600, time: 16000 }, // D3
      { midi: 55, duration: 1600, time: 16000 }, // G3
      { midi: 38, duration: 1600, time: 17600 }, // D2 (bass)
      { midi: 50, duration: 1600, time: 17600 }, // D3
      { midi: 57, duration: 1600, time: 17600 }, // A3
      
      // F – E – D – C – E – D – C – B
      { midi: 77, duration: 400, time: 19200 },  // F5
      { midi: 76, duration: 400, time: 19600 },  // E5
      { midi: 74, duration: 400, time: 20000 },  // D5
      { midi: 72, duration: 400, time: 20400 },  // C5
      { midi: 76, duration: 400, time: 20800 },  // E5
      { midi: 74, duration: 400, time: 21200 },  // D5
      { midi: 72, duration: 400, time: 21600 },  // C5
      { midi: 71, duration: 400, time: 22000 },  // B4
      
      // Left hand accompaniment
      { midi: 41, duration: 1600, time: 19200 }, // F2 (bass)
      { midi: 48, duration: 1600, time: 19200 }, // C3
      { midi: 53, duration: 1600, time: 19200 }, // F3
      { midi: 40, duration: 1600, time: 20800 }, // E2 (bass)
      { midi: 47, duration: 1600, time: 20800 }, // B2
      { midi: 52, duration: 1600, time: 20800 }, // E3
      
      // Return to the main theme
      // E – D# – E – D# – E – B – D – C – A
      { midi: 76, duration: 400, time: 22400 },  // E5
      { midi: 75, duration: 400, time: 22800 },  // D#5
      { midi: 76, duration: 400, time: 23200 },  // E5
      { midi: 75, duration: 400, time: 23600 },  // D#5
      { midi: 76, duration: 400, time: 24000 },  // E5
      { midi: 71, duration: 400, time: 24400 },  // B4
      { midi: 74, duration: 400, time: 24800 },  // D5
      { midi: 72, duration: 400, time: 25200 },  // C5
      { midi: 69, duration: 800, time: 25600 },  // A4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 25600 },  // A2 (bass)
      { midi: 52, duration: 800, time: 25600 },  // E3
      { midi: 57, duration: 800, time: 25600 },  // A3
      
      // C – E – A – B – E – G# – B – C
      { midi: 60, duration: 400, time: 26400 },  // C4
      { midi: 64, duration: 400, time: 26800 },  // E4
      { midi: 69, duration: 400, time: 27200 },  // A4
      { midi: 71, duration: 800, time: 27600 },  // B4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 40, duration: 800, time: 27600 },  // E2 (bass)
      { midi: 47, duration: 800, time: 27600 },  // B2
      { midi: 52, duration: 800, time: 27600 },  // E3
      
      { midi: 64, duration: 400, time: 28400 },  // E4
      { midi: 68, duration: 400, time: 28800 },  // G#4
      { midi: 71, duration: 400, time: 29200 },  // B4
      { midi: 72, duration: 800, time: 29600 },  // C5 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 29600 },  // A2 (bass)
      { midi: 52, duration: 800, time: 29600 },  // E3
      { midi: 57, duration: 800, time: 29600 },  // A3
      
      // Final theme repetition
      // E – D# – E – D# – E – B – D – C – A
      { midi: 76, duration: 400, time: 30400 },  // E5
      { midi: 75, duration: 400, time: 30800 },  // D#5
      { midi: 76, duration: 400, time: 31200 },  // E5
      { midi: 75, duration: 400, time: 31600 },  // D#5
      { midi: 76, duration: 400, time: 32000 },  // E5
      { midi: 71, duration: 400, time: 32400 },  // B4
      { midi: 74, duration: 400, time: 32800 },  // D5
      { midi: 72, duration: 400, time: 33200 },  // C5
      { midi: 69, duration: 800, time: 33600 },  // A4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 45, duration: 800, time: 33600 },  // A2 (bass)
      { midi: 52, duration: 800, time: 33600 },  // E3
      { midi: 57, duration: 800, time: 33600 },  // A3
      
      // C – E – A – B – E – C – B – A (final phrase)
      { midi: 60, duration: 400, time: 34400 },  // C4
      { midi: 64, duration: 400, time: 34800 },  // E4
      { midi: 69, duration: 400, time: 35200 },  // A4
      { midi: 71, duration: 800, time: 35600 },  // B4 (slightly longer)
      
      // Left hand accompaniment
      { midi: 40, duration: 800, time: 35600 },  // E2 (bass)
      { midi: 47, duration: 800, time: 35600 },  // B2
      { midi: 52, duration: 800, time: 35600 },  // E3
      
      { midi: 64, duration: 400, time: 36400 },  // E4
      { midi: 72, duration: 400, time: 36800 },  // C5
      { midi: 71, duration: 400, time: 37200 },  // B4
      { midi: 69, duration: 1200, time: 37600 }, // A4 (final note, longer)
      
      // Final left hand chord
      { midi: 45, duration: 1200, time: 37600 }, // A2 (bass)
      { midi: 52, duration: 1200, time: 37600 }, // E3
      { midi: 57, duration: 1200, time: 37600 }, // A3
    ],
    range: { min: 38, max: 79 }, // D2 to G5
  };
export default furElise