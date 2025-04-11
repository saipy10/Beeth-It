"use client"

import { useEffect } from "react"
import { usePianoStore } from "../store/piano-store"

export function useKeyboardInput() {
  const { startKey, pressKey, releaseKey } = usePianoStore()

  useEffect(() => {
    // Map keyboard keys to piano keys
    // We'll use two rows of the keyboard to map to white and black keys
    const keyMap: Record<string, number> = {
      // Lower row for white keys
      z: 0,
      x: 2,
      c: 4,
      v: 5,
      b: 7,
      n: 9,
      m: 11,
      ",": 12,
      // Upper row for black keys
      s: 1,
      d: 3,
      g: 6,
      h: 8,
      j: 10,
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key.toLowerCase()
      if (keyMap[key] !== undefined && !e.repeat) {
        const noteIndex = startKey + keyMap[key]
        pressKey(noteIndex)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keyMap[key] !== undefined) {
        const noteIndex = startKey + keyMap[key]
        releaseKey(noteIndex)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [startKey, pressKey, releaseKey])
}
