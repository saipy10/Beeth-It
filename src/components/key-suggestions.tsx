"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePianoStore } from "@/store/piano-store"

export default function KeySuggestions() {
  const { suggestedKeys, setSuggestedKeys } = usePianoStore()
  const [currentScale, setCurrentScale] = useState("C Major")

  // Define common scales
  const scales = {
    "C Major": [39, 41, 43, 44, 46, 48, 50, 51],
    "G Major": [35, 37, 39, 40, 42, 44, 46, 47],
    "F Major": [33, 35, 37, 39, 40, 42, 44, 45],
    "A Minor": [36, 38, 39, 41, 43, 44, 46, 48],
  }

  // Change scale
  const changeScale = (scale: string) => {
    setCurrentScale(scale)
    setSuggestedKeys(scales[scale as keyof typeof scales])
  }

  return (
    <div className="h-full w-full flex items-center justify-between px-4 py-2 bg-black/30 rounded-lg">
      <div className="text-purple-200">
        <span className="mr-2">Suggested Keys:</span>
        <span className="font-semibold">{currentScale}</span>
      </div>

      <div className="flex gap-2">
        {Object.keys(scales).map((scale) => (
          <motion.button
            key={scale}
            className={`px-3 py-1 rounded-md text-sm ${
              currentScale === scale ? "bg-purple-600 text-white" : "bg-black/20 text-purple-300 hover:bg-purple-900/50"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => changeScale(scale)}
          >
            {scale}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
