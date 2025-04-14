// src/components/PianoControls.tsx
// import { usePianoStore } from "@/store/piano-store";
import { useState } from "react";

interface PianoControlsProps {
  visibleKeys: number;
  startKey: number;
  setVisibleKeys: (count: number) => void;
  setStartKey: (key: number) => void;
}

export function PianoControls({
  visibleKeys,
  startKey,
  setVisibleKeys,
  setStartKey,
}: PianoControlsProps) {
  const [isSizeHovered, setIsSizeHovered] = useState(false);
  const [isShiftHovered, setIsShiftHovered] = useState(false);

  const handleIncreaseKeys = () => {
    if (visibleKeys < 18) {
      setVisibleKeys(visibleKeys + 1);
    }
  };

  const handleDecreaseKeys = () => {
    if (visibleKeys > 1) {
      setVisibleKeys(visibleKeys - 1);
    }
  };

  const handleSlideLeft = () => {
    setStartKey(Math.max(0, startKey - 1));
  };

  const handleSlideRight = () => {
    const maxStart = 87 - visibleKeys + 1;
    setStartKey(Math.min(maxStart, startKey + 1));
  };

  const keyToNote = (key: number): string => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(key / 12) - 1;
    const noteIndex = key % 12;
    return `${notes[noteIndex]}${octave}`;
  };

  return (
    <div className="relative w-full max-w-6xl flex justify-between items-center mb-6 px-4">
      {/* Size controls (left side) */}
      <div
        className="relative flex items-center gap-2"
        onMouseEnter={() => setIsSizeHovered(true)}
        onMouseLeave={() => setIsSizeHovered(false)}
      >
        <div
          className={`flex items-center gap-2 bg-indigo-900/50 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg transition-opacity duration-300 ${
            isSizeHovered ? "opacity-100" : "opacity-20"
          }`}
        >
          {visibleKeys > 1 && (
            <button
              onClick={handleDecreaseKeys}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-base transition-all duration-200 ${
                visibleKeys <= 1
                  ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                  : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95"
              }`}
              aria-label="Decrease key count"
            >
              −
            </button>
          )}
          <span className="text-white font-medium text-base min-w-[80px] text-center">
            {visibleKeys} Keys
          </span>
          {visibleKeys < 18 && (
            <button
              onClick={handleIncreaseKeys}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-base transition-all duration-200 ${
                visibleKeys >= 18
                  ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                  : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95"
              }`}
              aria-label="Increase key count"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Shift controls (right side) */}
      <div
        className="relative flex items-center gap-2"
        onMouseEnter={() => setIsShiftHovered(true)}
        onMouseLeave={() => setIsShiftHovered(false)}
      >
        <div
          className={`flex items-center gap-2 bg-indigo-900/50 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg transition-opacity duration-300 ${
            isShiftHovered ? "opacity-100" : "opacity-20"
          }`}
        >
          {startKey > 0 && (
            <button
              onClick={handleSlideLeft}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-base transition-all duration-200 ${
                startKey <= 0
                  ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                  : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95"
              }`}
              aria-label="Shift keyboard left"
            >
              ◄
            </button>
          )}
          <span className="text-white font-medium text-base min-w-[80px] text-center">
            {keyToNote(startKey)} - {keyToNote(startKey + visibleKeys - 1)}
          </span>
          {startKey < 87 - visibleKeys + 1 && (
            <button
              onClick={handleSlideRight}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-base transition-all duration-200 ${
                startKey >= 87 - visibleKeys + 1
                  ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                  : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95"
              }`}
              aria-label="Shift keyboard right"
            >
              ►
            </button>
          )}
        </div>
      </div>
    </div>
  );
}