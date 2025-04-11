"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePianoStore, keyToNote } from "@/store/piano-store";

export default function KeySuggestions() {
  const { suggestedKeys, setSuggestedKeys } = usePianoStore();
  const [currentScale, setCurrentScale] = useState("C Major");

  // Define common scales with key indices
  const scales = {
    "C Major": [39, 41, 43, 44, 46, 48, 50, 51], // C4 to C5
    "G Major": [35, 37, 39, 40, 42, 44, 46, 47], // G3 to G4
    "F Major": [33, 35, 37, 39, 40, 42, 44, 45], // F3 to F4
    "A Minor": [36, 38, 39, 41, 43, 44, 46, 48], // A3 to A4
  };

  // Convert suggestedKeys to note names
  const suggestedNotes = Array.from(suggestedKeys).map(keyToNote).join(", ");

  // Change scale and update suggested keys
  const changeScale = (scale: string) => {
    setCurrentScale(scale);
    setSuggestedKeys(scales[scale as keyof typeof scales]);
  };

  return (
    <div className="h-full w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-black/20 to-gray-900/20 rounded-lg backdrop-blur-sm border border-purple-900/30">
      {/* Suggested Keys Display */}
      <div className="text-purple-200 flex items-center gap-2">
        <span className="text-sm">Suggested Keys:</span>
        <motion.span
          className="font-semibold text-purple-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentScale} ({suggestedNotes || "None"})
        </motion.span>
      </div>

      {/* Scale Buttons */}
      <div className="flex gap-2">
        {Object.keys(scales).map((scale) => (
          <motion.button
            key={scale}
            className={`
              px-3 py-1 rounded-md text-sm shadow-md
              ${
                currentScale === scale
                  ? "bg-purple-600 text-white"
                  : "bg-black/30 text-purple-300 hover:bg-purple-900/60"
              }
            `}
            whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(168, 85, 247, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => changeScale(scale)}
          >
            {scale}
          </motion.button>
        ))}
      </div>
    </div>
  );
}