"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePianoStore, keyToNote } from "@/store/piano-store";
import { Loader2, Play } from "lucide-react";

export default function PianoKeyboard() {
  const {
    startKey,
    visibleKeys,
    activeKeys,
    pressKey,
    releaseKey,
    suggestedKeys,
    isLoading,
    initAudio,
  } = usePianoStore();

  const pianoRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInitialized.current) {
        console.log("Triggering initAudio from user click");
        initAudio();
        hasInitialized.current = true;
      }
    };

    const pianoElement = pianoRef.current;
    if (pianoElement) {
      pianoElement.addEventListener("click", handleFirstInteraction, { once: true });
    }
    return () => {
      if (pianoElement) {
        pianoElement.removeEventListener("click", handleFirstInteraction);
      }
    };
  }, [initAudio]);

  // Handle keyboard input
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 0, // C
      w: 1, // C#
      s: 2, // D
      e: 3, // D#
      d: 4, // E
      f: 5, // F
      t: 6, // F#
      g: 7, // G
      y: 8, // G#
      h: 9, // A
      u: 10, // A#
      j: 11, // B
      k: 12, // High C
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pianoRef.current?.contains(document.activeElement)) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] !== undefined && !e.repeat) {
        const noteIndex = startKey + keyMap[key];
        if (noteIndex >= 0 && noteIndex < 88) pressKey(noteIndex);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!pianoRef.current?.contains(document.activeElement)) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] !== undefined) {
        const noteIndex = startKey + keyMap[key];
        if (noteIndex >= 0 && noteIndex < 88) releaseKey(noteIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startKey, pressKey, releaseKey]);

  // Handle global mouseup
  useEffect(() => {
    const handleMouseUp = () => {
      activeKeys.forEach((key) => releaseKey(key));
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [activeKeys, releaseKey]);

  // Generate visible keys
  const keys = useMemo(
    () =>
      Array.from({ length: visibleKeys }, (_, i) => {
        const keyIndex = startKey + i;
        const isBlackKey = [1, 3, 6, 8, 10].includes(keyIndex % 12);
        const isActive = activeKeys.has(keyIndex);
        // Keep isSuggested for potential future use, but it won't affect rendering
        const isSuggested = suggestedKeys.includes(keyIndex);
        return { keyIndex, isBlackKey, isActive, isSuggested };
      }),
    [startKey, visibleKeys, activeKeys, suggestedKeys]
  );

  return (
    <div className="h-full w-full flex items-end justify-center p-4 bg-gradient-to-t from-blue-900/20 to-transparent">
      <div
        ref={pianoRef}
        tabIndex={0}
        className="relative h-[80%] w-full max-w-7xl backdrop-blur-sm bg-black/10 rounded-lg overflow-hidden focus:outline-none"
      >
        {/* Piano body */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-black/80 rounded-lg border border-purple-900/30" />

        {/* Piano lid */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-b border-purple-900/20" />

        {/* Loading overlay */}
        <AnimatePresence>
          {!hasInitialized.current || isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 z-50"
            >
              <div className="flex flex-col items-center text-center">
                {!hasInitialized.current ? (
                  <>
                    <Play className="w-10 h-10 text-purple-400 mb-2" />
                    <p className="text-purple-200">Click to start the piano</p>
                  </>
                ) : (
                  isLoading && (
                    <>
                      <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-2" />
                      <p className="text-purple-200">Loading piano samples...</p>
                    </>
                  )
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* White keys */}
        <div className="relative flex h-full w-full pt-12">
          {keys
            .filter((key) => !key.isBlackKey)
            .map(({ keyIndex, isActive }) => (
              <motion.div
                key={`white-${keyIndex}`}
                className={`
                  relative flex-1 rounded-b-md border-l border-r border-b border-purple-900/50
                  ${isActive ? "bg-purple-300" : "bg-white/80"}
                  transition-colors cursor-pointer
                `}
                whileTap={{ y: 4 }}
                onMouseDown={() => pressKey(keyIndex)}
                onMouseUp={() => releaseKey(keyIndex)}
                onMouseLeave={() =>
                  activeKeys.has(keyIndex) && releaseKey(keyIndex)
                }
              >
                {/* Key shadow */}
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-black/10" />

                {/* Key reflection */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/20 to-transparent rounded-b-md" />

                {/* Key label */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  {keyToNote(keyIndex)}
                </div>

                {/* Keyboard shortcut */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 font-mono">
                  {getKeyboardShortcut(keyIndex - startKey)}
                </div>

                {/* Glow effect when active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-purple-400 rounded-b-md filter blur-md"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
        </div>

        {/* Black keys */}
        <div className="absolute top-12 left-0 right-0 flex h-[65%]">
          {keys.map(({ keyIndex, isBlackKey, isActive }) => {
            if (!isBlackKey) return null;

            const whiteKeysBefore = keys.filter(
              (k) => !k.isBlackKey && k.keyIndex < keyIndex
            ).length;

            return (
              <motion.div
                key={`black-${keyIndex}`}
                className={`
                  absolute w-[8%] h-full rounded-b-md
                  ${isActive ? "bg-purple-400" : "bg-gray-800/80"}
                  transition-colors cursor-pointer
                `}
                style={{
                  left: `calc(${
                    whiteKeysBefore *
                    (100 /
                      (keys.length - keys.filter((k) => k.isBlackKey).length))
                  }% - 4%)`,
                }}
                whileTap={{ y: 4 }}
                onMouseDown={() => pressKey(keyIndex)}
                onMouseUp={() => releaseKey(keyIndex)}
                onMouseLeave={() =>
                  activeKeys.has(keyIndex) && releaseKey(keyIndex)
                }
              >
                {/* Key reflection */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/10 to-transparent rounded-b-md" />

                {/* Keyboard shortcut */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 font-mono">
                  {getKeyboardShortcut(keyIndex - startKey)}
                </div>

                {/* Glow effect when active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-purple-500 rounded-b-md filter blur-md"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to get keyboard shortcut
function getKeyboardShortcut(relativeIndex: number): string {
  const shortcuts = [
    "A",
    "W",
    "S",
    "E",
    "D",
    "F",
    "T",
    "G",
    "Y",
    "H",
    "U",
    "J",
    "K",
  ];
  return relativeIndex >= 0 && relativeIndex < shortcuts.length
    ? shortcuts[relativeIndex]
    : "";
}