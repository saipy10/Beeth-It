"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePianoStore, keyToNote } from "@/store/piano-store";
import { Loader2, Play } from "lucide-react";
import { PianoControls } from "@/components/piano-controls";

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
    setVisibleKeys,
    setStartKey,
  } = usePianoStore();

  const pianoRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const keyboardKeysDown = useRef(new Set<string>());
  const mouseKeyDown = useRef(new Set<number>());
  const touchRegistry = useRef(new Map<number, number>());
  const [glowIntensity, setGlowIntensity] = useState(0);
  const isMouseDown = useRef(false);

  // Cache key elements
  const keyElementsCache = useRef(new Map<number, HTMLElement>());

  // Animate glow intensity
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => {
        const newValue = prev + 0.02;
        return newValue > 1 ? 0 : newValue;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize audio
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInitialized.current) {
        initAudio();
        hasInitialized.current = true;
      }
    };

    const piano = pianoRef.current;
    if (piano) {
      piano.addEventListener("click", handleFirstInteraction, { once: true });
      piano.addEventListener("touchstart", handleFirstInteraction, { once: true });
    }
    return () => {
      if (piano) {
        piano.removeEventListener("click", handleFirstInteraction);
        piano.removeEventListener("touchstart", handleFirstInteraction);
      }
    };
  }, [initAudio]);

  // Clear key cache on range change
  useEffect(() => {
    keyElementsCache.current.clear();
  }, [startKey, visibleKeys]);

  // Handle keyboard input with dynamic black/white keybindings
  useEffect(() => {
    const whiteKeyShortcuts = [
      "a",
      "s",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
      "z",
      "x",
      "c",
      "v",
    ];
    const blackKeyShortcuts = ["w", "e", "t", "y", "u", "i", "o", "p"];

    const keyMap: Record<string, number> = {};
    let whiteIndex = 0;
    let blackIndex = 0;

    for (let i = 0; i < visibleKeys; i++) {
      const keyIndex = startKey + i;
      const isBlackKey = [1, 3, 6, 8, 10].includes(keyIndex % 12);
      if (isBlackKey && blackIndex < blackKeyShortcuts.length) {
        keyMap[blackKeyShortcuts[blackIndex]] = keyIndex;
        blackIndex++;
      } else if (!isBlackKey && whiteIndex < whiteKeyShortcuts.length) {
        keyMap[whiteKeyShortcuts[whiteIndex]] = keyIndex;
        whiteIndex++;
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !pianoRef.current?.contains(document.activeElement) &&
        document.activeElement !== document.body
      )
        return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStartKey(Math.max(0, startKey - 1));
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const maxStart = 87 - visibleKeys + 1;
        setStartKey(Math.min(maxStart, startKey + 1));
        return;
      }

      const key = e.key.toLowerCase();
      if (keyboardKeysDown.current.has(key) || keyMap[key] === undefined) return;
      e.preventDefault();
      keyboardKeysDown.current.add(key);
      const noteIndex = keyMap[key];
      if (noteIndex >= startKey && noteIndex < startKey + visibleKeys) {
        requestAnimationFrame(() => pressKey(noteIndex));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMap[key] === undefined) return;
      e.preventDefault();
      keyboardKeysDown.current.delete(key);
      const noteIndex = keyMap[key];
      if (noteIndex >= startKey && noteIndex < startKey + visibleKeys) {
        requestAnimationFrame(() => releaseKey(noteIndex));
      }
    };

    const cleanupKeys = () => {
      keyboardKeysDown.current.forEach((key) => {
        if (keyMap[key] !== undefined) {
          const noteIndex = keyMap[key];
          if (noteIndex >= 0 && noteIndex < 88) releaseKey(noteIndex);
        }
      });
      keyboardKeysDown.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    window.addEventListener("blur", cleanupKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", cleanupKeys);
      cleanupKeys();
    };
  }, [startKey, visibleKeys, pressKey, releaseKey, setStartKey]);

  // Handle mouse and touch events
  useEffect(() => {
    const getKeyElement = (x: number, y: number): HTMLElement | null => {
      const elements = document.elementsFromPoint(x, y);
      for (const el of elements) {
        const element = el as HTMLElement;
        if (element?.dataset.keyIndex) {
          return element;
        }
      }
      return null;
    };

    const getKeyIndex = (x: number, y: number): number | null => {
      const element = getKeyElement(x, y);
      if (!element?.dataset.keyIndex) return null;
      const keyIndex = parseInt(element.dataset.keyIndex);
      keyElementsCache.current.set(keyIndex, element);
      return keyIndex;
    };

    const handleKeyPress = (keyIndex: number) => {
      if (keyIndex !== null && !mouseKeyDown.current.has(keyIndex)) {
        mouseKeyDown.current.add(keyIndex);
        requestAnimationFrame(() => pressKey(keyIndex));
      }
    };

    const handleKeyRelease = (keyIndex: number) => {
      if (mouseKeyDown.current.has(keyIndex)) {
        mouseKeyDown.current.delete(keyIndex);
        requestAnimationFrame(() => releaseKey(keyIndex));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      const keyIndex = getKeyIndex(e.clientX, e.clientY);
      if (keyIndex !== null) {
        handleKeyPress(keyIndex);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const keyIndex = getKeyIndex(e.clientX, e.clientY);
      mouseKeyDown.current.forEach((activeKeyIndex) => {
        if (keyIndex !== activeKeyIndex) {
          handleKeyRelease(activeKeyIndex);
        }
      });
      if (keyIndex !== null && !mouseKeyDown.current.has(keyIndex)) {
        handleKeyPress(keyIndex);
      }
    };

    const handleMouseUp = () => {
      if (isMouseDown.current) {
        mouseKeyDown.current.forEach((keyIndex) => {
          handleKeyRelease(keyIndex);
        });
        isMouseDown.current = false;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach((touch) => {
        const keyIndex = getKeyIndex(touch.clientX, touch.clientY);
        if (keyIndex !== null) {
          touchRegistry.current.set(touch.identifier, keyIndex);
          requestAnimationFrame(() => pressKey(keyIndex));
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach((touch) => {
        const newKeyIndex = getKeyIndex(touch.clientX, touch.clientY);
        const oldKeyIndex = touchRegistry.current.get(touch.identifier);
        if (
          oldKeyIndex !== undefined &&
          newKeyIndex !== null &&
          oldKeyIndex !== newKeyIndex
        ) {
          requestAnimationFrame(() => releaseKey(oldKeyIndex));
          touchRegistry.current.set(touch.identifier, newKeyIndex);
          requestAnimationFrame(() => pressKey(newKeyIndex));
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach((touch) => {
        const keyIndex = touchRegistry.current.get(touch.identifier);
        if (keyIndex !== undefined) {
          touchRegistry.current.delete(touch.identifier);
          requestAnimationFrame(() => releaseKey(keyIndex));
        }
      });
    };

    const piano = pianoRef.current;
    if (piano) {
      piano.style.touchAction = "none";
      piano.addEventListener("mousedown", handleMouseDown);
      piano.addEventListener("touchstart", handleTouchStart, { passive: false });
      piano.addEventListener("touchmove", handleTouchMove, { passive: false });
      piano.addEventListener("touchend", handleTouchEnd, { passive: false });
      piano.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);

    return () => {
      if (piano) {
        piano.style.touchAction = "";
        piano.removeEventListener("mousedown", handleMouseDown);
        piano.removeEventListener("touchstart", handleTouchStart);
        piano.removeEventListener("touchmove", handleTouchMove);
        piano.removeEventListener("touchend", handleTouchEnd);
        piano.removeEventListener("touchcancel", handleTouchEnd);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
      mouseKeyDown.current.forEach((keyIndex) => {
        releaseKey(keyIndex);
      });
      mouseKeyDown.current.clear();
      isMouseDown.current = false;
    };
  }, [pressKey, releaseKey]);

  // Generate keys
  const keys = useMemo(
    () =>
      Array.from({ length: visibleKeys }, (_, i) => {
        const keyIndex = startKey + i;
        const isBlackKey = [1, 3, 6, 8, 10].includes(keyIndex % 12);
        return {
          keyIndex,
          isBlackKey,
          isActive: activeKeys.has(keyIndex),
          isSuggested: suggestedKeys.includes(keyIndex),
          noteColor: getNoteColor(keyIndex % 12),
        };
      }),
    [startKey, visibleKeys, activeKeys, suggestedKeys]
  );

  // Generate note color based on pitch class
  function getNoteColor(notePosition: number) {
    const colors = [
      "from-purple-600/40 to-purple-700/30", // C - vibrant purple
      "from-indigo-700/40 to-indigo-800/30", // C# - deep indigo
      "from-blue-600/40 to-blue-700/30", // D - rich blue
      "from-cyan-600/40 to-teal-600/30", // D# - teal-cyan
      "from-teal-600/40 to-teal-700/30", // E - deep teal
      "from-green-600/40 to-green-700/30", // F - forest green
      "from-lime-600/40 to-lime-700/30", // F# - olive lime
      "from-yellow-600/40 to-amber-600/30", // G - golden yellow
      "from-amber-600/40 to-amber-700/30", // G# - deep amber
      "from-orange-600/40 to-orange-700/30", // A - vivid orange
      "from-red-600/40 to-red-700/30", // A# - crimson red
      "from-pink-600/40 to-pink-700/30", // B - hot pink
    ];
    return colors[notePosition];
  }

  // Get key glow color based on pitch class
  function getGlowColor(notePosition: number, isActive: boolean) {
    if (!isActive) return "rgba(0, 0, 0, 0)";

    const colors = [
      "rgba(153, 51, 255, 0.8)", // C - vibrant purple
      "rgba(67, 56, 202, 0.8)", // C# - deep indigo
      "rgba(37, 99, 235, 0.8)", // D - rich blue
      "rgba(8, 145, 178, 0.8)", // D# - teal-cyan
      "rgba(13, 148, 136, 0.8)", // E - deep teal
      "rgba(21, 128, 61, 0.8)", // F - forest green
      "rgba(101, 163, 13, 0.8)", // F# - olive lime
      "rgba(202, 138, 4, 0.8)", // G - golden yellow
      "rgba(217, 119, 6, 0.8)", // G# - deep amber
      "rgba(234, 88, 12, 0.8)", // A - vivid orange
      "rgba(220, 38, 38, 0.8)", // A# - crimson red
      "rgba(219, 39, 119, 0.8)", // B - hot pink
    ];
    return colors[notePosition];
  }

  // Keyboard shortcuts for black/white keys
  function getKeyboardShortcut(keyIndex: number): string {
    const whiteKeyShortcuts = [
      "A",
      "S",
      "D",
      "F",
      "G",
      "H",
      "J",
      "K",
      "L",
      "Z",
      "X",
      "C",
      "V",
    ];
    const blackKeyShortcuts = ["W", "E", "T", "Y", "U", "I", "O", "P"];
    let whiteIndex = 0;
    let blackIndex = 0;

    for (let i = 0; i < visibleKeys; i++) {
      const currentKey = startKey + i;
      const isBlackKey = [1, 3, 6, 8, 10].includes(currentKey % 12);
      if (currentKey === keyIndex) {
        if (isBlackKey && blackIndex < blackKeyShortcuts.length) {
          return blackKeyShortcuts[blackIndex];
        } else if (!isBlackKey && whiteIndex < whiteKeyShortcuts.length) {
          return whiteKeyShortcuts[whiteIndex];
        }
      }
      if (isBlackKey) blackIndex++;
      else whiteIndex++;
    }
    return "";
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-end p-4 bg-gradient-to-b from-black/5 to-black/20">
      {/* Controls */}
      <PianoControls
        visibleKeys={visibleKeys}
        startKey={startKey}
        setVisibleKeys={setVisibleKeys}
        setStartKey={setStartKey}
      />

      <div
        ref={pianoRef}
        tabIndex={0}
        className="relative h-[80%] w-full max-w-6xl focus:outline-none"
        style={{
          perspective: "1200px",
          filter: `drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))`,
        }}
      >
        {/* Ambient background glow */}
        <div
          className="absolute inset-0 -z-10 rounded-lg opacity-30"
          style={{
            background: `radial-gradient(circle at ${
              50 + Math.sin(glowIntensity * Math.PI * 2) * 15
            }% ${50 + Math.cos(glowIntensity * Math.PI * 2) * 15}%, rgba(120, 120, 255, 0.3), transparent 70%)`,
            filter: "blur(40px)",
          }}
        />

        <AnimatePresence>
          {!hasInitialized.current || isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50 rounded-xl"
            >
              <div className="flex flex-col items-center">
                {!hasInitialized.current ? (
                  <>
                    <Play className="w-8 h-8 text-white mb-2" />
                    <p className="text-white text-sm">Click to start</p>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                    <p className="text-white text-sm">Loading...</p>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* White keys */}
        <div className="relative flex h-full w-full">
          {keys
            .filter((key) => !key.isBlackKey)
            .map(({ keyIndex, isActive, isSuggested, noteColor }) => {
              const notePos = keyIndex % 12;
              return (
                <motion.div
                  key={`white-${keyIndex}`}
                  data-key-index={keyIndex}
                  className={`relative flex-1 rounded-lg cursor-pointer z-10 pointer-events-auto overflow-hidden backdrop-blur-sm border border-white/20`}
                  style={{
                    background: isActive
                      ? `linear-gradient(to bottom, ${getGlowColor(
                          notePos,
                          true
                        )} 0%, rgba(255, 255, 255, 0.15) 100%)`
                      : `linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)`,
                    boxShadow: isActive
                      ? `0 0 20px ${getGlowColor(
                          notePos,
                          true
                        )}, inset 0 0 10px rgba(255, 255, 255, 0.5)`
                      : isSuggested
                      ? "0 0 10px rgba(120, 120, 255, 0.4), inset 0 0 5px rgba(120, 120, 255, 0.2)"
                      : "none",
                  }}
                  animate={{
                    y: isActive ? 4 : 0,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                >
                  {/* Subtle color gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${noteColor} opacity-${
                      isActive ? 80 : 40
                    }`}
                  />

                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />

                  {/* Edge highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-white/50" />

                  {/* Key label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white font-medium">
                    {keyToNote(keyIndex)}
                  </div>

                  {/* Keyboard shortcut */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/90">
                    {getKeyboardShortcut(keyIndex)}
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Black keys */}
        <div className="absolute top-0 left-0 right-0 h-[60%]">
          {keys.map(({ keyIndex, isBlackKey, isActive, isSuggested, noteColor }) => {
            if (!isBlackKey) return null;
            const whiteKeysBefore = keys.filter(
              (k) => !k.isBlackKey && k.keyIndex < keyIndex
            ).length;
            const notePos = keyIndex % 12;

            return (
              <motion.div
                key={`black-${keyIndex}`}
                data-key-index={keyIndex}
                className="absolute w-[8.5%] h-full rounded-lg cursor-pointer z-20 pointer-events-auto overflow-hidden backdrop-blur-md border border-black/50"
                style={{
                  left: `calc(${
                    whiteKeysBefore *
                    (100 / (keys.length - keys.filter((k) => k.isBlackKey).length))
                  }% - 4.25%)`,
                  background: isActive
                    ? `linear-gradient(to bottom, ${getGlowColor(
                        notePos,
                        true
                      )} 0%, rgba(0, 0, 0, 0.8) 100%)`
                    : "linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.8) 100%)",
                  boxShadow: isActive
                    ? `0 0 20px ${getGlowColor(
                        notePos,
                        true
                      )}, inset 0 0 10px rgba(255, 255, 255, 0.3)`
                    : isSuggested
                    ? "0 0 10px rgba(120, 120, 255, 0.4), inset 0 0 5px rgba(120, 120, 255, 0.2)"
                    : "0 4px 6px rgba(0, 0, 0, 0.3)",
                }}
                animate={{
                  y: isActive ? 4 : 0,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
              >
                {/* Subtle color gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${noteColor} opacity-${
                    isActive ? 60 : 30
                  } mix-blend-overlay`}
                />

                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30" />

                {/* Edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

                {/* Keyboard shortcut */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/80">
                  {getKeyboardShortcut(keyIndex)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Base glow reflection */}
        <div
          className="absolute left-0 right-0 bottom-0 h-32 -z-10 opacity-30"
          style={{
            background: `linear-gradient(to top, rgba(130, 130, 255, 0.15), transparent)`,
            filter: "blur(20px)",
            transform: "translateY(40%)",
          }}
        />
      </div>
    </div>
  );
}