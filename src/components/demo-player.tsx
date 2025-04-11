"use client"

import { motion } from "framer-motion"
import { usePianoStore } from "@/store/piano-store"
import { Music, Loader2 } from "lucide-react"

export default function DemoPlayer() {
  const { isPlayingDemo, playDemo, stopDemo, isLoading } = usePianoStore()

  return (
    <motion.div
      className="absolute bottom-6 right-6 z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full 
          ${isPlayingDemo ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"} 
          text-white shadow-lg
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        onClick={isLoading ? undefined : isPlayingDemo ? stopDemo : playDemo}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Music size={18} />
            <span>{isPlayingDemo ? "Stop Demo" : "Play Fur Elise"}</span>
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
