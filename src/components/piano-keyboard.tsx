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
        const isSuggested = suggestedKeys.includes(keyIndex);
        return { keyIndex, isBlackKey, isActive, isSuggested };
      }),
    [startKey, visibleKeys, activeKeys, suggestedKeys]
  );

  // Nebula theme styles
  const nebulaStyles = {
    container: "bg-transparent",
    body: "bg-indigo-950/5 backdrop-blur-[28px] border border-purple-500/10 rounded-xl shadow-[0_20px_80px_rgba(168,85,247,0.2),inset_0_0_60px_rgba(147,112,219,0.15)]",
    bodyStyle: {
      transform: "perspective(1200px) rotateX(3deg)",
    },
    reflections: (
      <>
        <div className="absolute -inset-[100%] bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-transparent rotate-45 animate-slow-pulse" />
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-pink-600/20 opacity-80 blur-lg" />
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-purple-400/15 to-transparent skew-x-[15deg] animate-slide-slow" />
      </>
    ),
    prisms: (
      <>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/15 via-blue-600/15 to-pink-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-600/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-2xl animate-slow-pulse" />
        {/* Starfield effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-star-1" style={{ top: "10%", left: "15%" }} />
          <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-star-2" style={{ top: "30%", left: "25%" }} />
          <div className="absolute w-1 h-1 bg-white/25 rounded-full animate-star-3" style={{ top: "50%", left: "40%" }} />
          <div className="absolute w-1 h-1 bg-white/15 rounded-full animate-star-4" style={{ top: "70%", left: "60%" }} />
          <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-star-5" style={{ top: "20%", left: "80%" }} />
          <div className="absolute w-2 h-2 bg-white/25 rounded-full animate-star-6" style={{ top: "40%", left: "10%" }} />
          <div className="absolute w-1 h-1 bg-white/15 rounded-full animate-star-7" style={{ top: "60%", left: "30%" }} />
          <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-star-8" style={{ top: "80%", left: "50%" }} />
        </div>
      </>
    ),
    lid: "bg-indigo-950/10 backdrop-blur-[28px] border-b border-purple-500/20",
    lidStyle: {
      transform: "perspective(1200px) rotateX(6deg)",
      transformOrigin: "bottom",
    },
    keyboardBase: "bg-indigo-950/10 backdrop-blur-2xl shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)]",
    whiteKey: (isActive: boolean, isSuggested: boolean) =>
      isActive
        ? "bg-gradient-to-b from-cyan-400/40 to-blue-600/30 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),0_4px_12px_rgba(100,200,255,0.5)]"
        : isSuggested
        ? "bg-gradient-to-b from-purple-500/25 to-indigo-600/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_2px_8px_rgba(168,85,247,0.3)]"
        : "bg-gradient-to-b from-blue-800/20 to-indigo-900/15 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_2px_8px_rgba(255,255,255,0.1)]",
    blackKey: (isActive: boolean, isSuggested: boolean) =>
      isActive
        ? "bg-gradient-to-b from-blue-900/50 to-black/40 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_12px_rgba(100,150,255,0.4)]"
        : isSuggested
        ? "bg-gradient-to-b from-purple-600/40 to-indigo-900/35 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),0_2px_8px_rgba(168,85,247,0.3)]"
        : "bg-gradient-to-b from-indigo-900/30 to-black/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),0_2px_8px_rgba(255,255,255,0.1)]",
  };

  return (
    <div className={`h-full w-full flex items-end justify-center p-4 ${nebulaStyles.container}`}>
      <div
        ref={pianoRef}
        tabIndex={0}
        className="relative h-[80%] w-full max-w-7xl backdrop-blur-lg bg-transparent rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-2xl"
      >
        {/* Piano body */}
        <div
          className={`absolute inset-0 ${nebulaStyles.body}`}
          style={nebulaStyles.bodyStyle}
        >
          {/* Beveled edges for realism */}
          <div className="absolute inset-0 border-2 border-transparent border-t-white/20 border-b-white/10 rounded-xl" />
        </div>

        {/* Reflections */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {nebulaStyles.reflections}
        </div>

        {/* Prism and starfield effects */}
        {nebulaStyles.prisms}

        {/* Piano lid */}
        <div
          className={`absolute top-0 left-0 right-0 h-16 ${nebulaStyles.lid}`}
          style={nebulaStyles.lidStyle}
        >
          <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-white/15 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-white/40" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
          <div className="absolute bottom-2 left-8 right-8 h-1 bg-white/5 rounded-full blur-sm shadow-[0_-2px_4px_rgba(0,0,0,0.2)]" />
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {!hasInitialized.current || isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
            >
              <div className="flex flex-col items-center text-center">
                {!hasInitialized.current ? (
                  <>
                    <Play className="w-10 h-10 text-white mb-2" />
                    <p className="text-white">Click to start the piano</p>
                  </>
                ) : (
                  isLoading && (
                    <>
                      <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                      <p className="text-white">Loading piano samples...</p>
                    </>
                  )
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Keyboard base */}
        <div className={`absolute top-16 left-0 right-0 bottom-0 ${nebulaStyles.keyboardBase}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/5" />
          <div className="absolute bottom-0 left-4 right-4 h-8 bg-black/8 blur-md shadow-[0_-4px_8px_rgba(0,0,0,0.2)]" />
        </div>

        {/* White keys */}
        <div className="relative flex h-full w-full pt-16">
          {keys
            .filter((key) => !key.isBlackKey)
            .map(({ keyIndex, isActive, isSuggested }) => (
              <motion.div
                key={`white-${keyIndex}`}
                className={`
                  relative flex-1 rounded-b-lg border-l border-r border-b border-white/10
                  ${nebulaStyles.whiteKey(isActive, isSuggested)}
                  cursor-pointer overflow-hidden backdrop-blur-[10px] z-10
                `}
                style={{
                  transform: `perspective(2000px) rotateX(${isActive ? 12 : 8}deg)`,
                  transformOrigin: "top",
                }}
                initial={false}
                animate={{
                  y: isActive ? 8 : 0,
                  z: isActive ? -15 : 0,
                  rotateX: isActive ? 12 : 8,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onMouseDown={() => pressKey(keyIndex)}
                onMouseUp={() => releaseKey(keyIndex)}
                onMouseLeave={() => activeKeys.has(keyIndex) && releaseKey(keyIndex)}
              >
                {/* Surface texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_50%)] opacity-50" />
                {/* Top bevel */}
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-white/30 to-transparent" />
                {/* Side bevels */}
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/20 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-white/20 to-transparent" />
                {/* Bottom reflection */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/15 to-transparent rounded-b-lg" />
                {/* Key label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/90 font-medium shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_2px_rgba(255,255,255,1)]">
                  {keyToNote(keyIndex)}
                </div>
                {/* Keyboard shortcut */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/80 font-mono">
                  {getKeyboardShortcut(keyIndex - startKey)}
                </div>
                {/* Active effects */}
                <AnimatePresence>
                  {isActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-cyan-400/35 rounded-b-lg blur-md -z-10"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-blue-500/25 rounded-b-lg blur-xl -z-10"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.4, opacity: 0.6 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-purple-400/20 rounded-b-lg blur-xl -z-10"
                      />
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{
                          scale: [0.95, 1.1, 0.95],
                          opacity: [0, 0.4, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-cyan-500/15 rounded-b-lg blur-lg -z-10"
                      />
                    </>
                  )}
                </AnimatePresence>
                {/* Suggested effects */}
                <AnimatePresence>
                  {isSuggested && !isActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.6, 1, 0.6],
                          transition: { repeat: Infinity, duration: 2 },
                        }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-purple-400/90 rounded-t-full shadow-[0_0_10px_rgba(168,85,247,0.9),0_0_5px_rgba(168,85,247,0.5)]"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          transition: { repeat: Infinity, duration: 2, delay: 0.5 },
                        }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-purple-400/30 rounded-full blur-xl"
                      />
                    </>
                  )}
                </AnimatePresence>
                {/* Pressed key bottom edge */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/30 to-transparent rounded-b-lg shadow-[0_-2px_4px_rgba(0,0,0,0.3)]" />
                )}
              </motion.div>
            ))}
        </div>

        {/* Black keys */}
        <div className="absolute top-16 left-0 right-0 h-[65%]">
          {keys.map(({ keyIndex, isBlackKey, isActive, isSuggested }) => {
            if (!isBlackKey) return null;

            const whiteKeysBefore = keys.filter(
              (k) => !k.isBlackKey && k.keyIndex < keyIndex
            ).length;

            return (
              <motion.div
                key={`black-${keyIndex}`}
                className={`
                  absolute w-[8%] h-full rounded-b-lg
                  ${nebulaStyles.blackKey(isActive, isSuggested)}
                  cursor-pointer overflow-hidden backdrop-blur-[12px] z-20
                `}
                style={{
                  left: `calc(${whiteKeysBefore * (100 / (keys.length - keys.filter((k) => k.isBlackKey).length))}% - 4%)`,
                  transform: `perspective(2000px) rotateX(${isActive ? 15 : 10}deg)`,
                  transformOrigin: "top",
                }}
                initial={false}
                animate={{
                  y: isActive ? 6 : 0,
                  z: isActive ? -12 : 0,
                  rotateX: isActive ? 15 : 10,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onMouseDown={() => pressKey(keyIndex)}
                onMouseUp={() => releaseKey(keyIndex)}
                onMouseLeave={() => activeKeys.has(keyIndex) && releaseKey(keyIndex)}
              >
                {/* Surface texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_50%)] opacity-220px opacity-60" />
                {/* Top bevel */}
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-white/25 to-transparent" />
                {/* Side bevels */}
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/20 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-white/20 to-transparent" />
                {/* Bottom reflection */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/25 to-transparent rounded-b-lg" />
                {/* Keyboard shortcut */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-300/90 font-mono">
                  {getKeyboardShortcut(keyIndex - startKey)}
                </div>
                {/* Active effects */}
                <AnimatePresence>
                  {isActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-blue-700/30 rounded-b-lg blur-md -z-10"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.3, opacity: 0.4 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-purple-600/20 rounded-b-lg blur-xl -z-10"
                      />
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{
                          scale: [0.95, 1.1, 0.95],
                          opacity: [0, 0.3, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-cyan-600/10 rounded-b-lg blur-lg -z-10"
                      />
                    </>
                  )}
                </AnimatePresence>
                {/* Suggested effects */}
                <AnimatePresence>
                  {isSuggested && !isActive && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.6, 1, 0.6],
                          transition: { repeat: Infinity, duration: 2 },
                        }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-purple-400/90 rounded-t-full shadow-[0_0_10px_rgba(168,85,247,0.9),0_0_5px_rgba(168,85,247,0.5)]"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.2, 0.5, 0.2],
                          transition: { repeat: Infinity, duration: 2, delay: 0.5 },
                        }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-500/30 rounded-full blur-xl"
                      />
                    </>
                  )}
                </AnimatePresence>
                {/* Pressed key bottom edge */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/40 to-transparent rounded-b-lg shadow-[0_-2px_4px_rgba(0,0,0,0.4)]" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Additional reflections */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[12deg] animate-slide" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/25" />
          <div className="absolute inset-y-0 left-0 w-px bg-white/30" />
          <div className="absolute inset-y-0 right-0 w-px bg-white/30" />
          <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/30 to-transparent rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-white/15 to-transparent rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-white/15 to-transparent rounded-br-xl" />
        </div>
      </div>
    </div>
  );
}

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