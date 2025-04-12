"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const keyboardKeysDown = useRef(new Set<string>());
  const mouseKeyDown = useRef(new Set<number>());
  const touchRegistry = useRef(new Map<number, number>());
  const [glowIntensity, setGlowIntensity] = useState(0);
  const isMouseDown = useRef(false);

  // Animate glow intensity
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => {
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

  // Handle keyboard input
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11,
      k: 12, l: 13, o: 14, p: 15, z: 16, x: 17, c: 18, v: 19,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pianoRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      const key = e.key.toLowerCase();
      if (keyboardKeysDown.current.has(key) || keyMap[key] === undefined) return;
      e.preventDefault();
      keyboardKeysDown.current.add(key);
      const noteIndex = startKey + keyMap[key];
      if (noteIndex >= 0 && noteIndex < 88) {
        requestAnimationFrame(() => pressKey(noteIndex));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMap[key] === undefined) return;
      e.preventDefault();
      keyboardKeysDown.current.delete(key);
      const noteIndex = startKey + keyMap[key];
      if (noteIndex >= 0 && noteIndex < 88) {
        requestAnimationFrame(() => releaseKey(noteIndex));
      }
    };

    const cleanupKeys = () => {
      keyboardKeysDown.current.forEach((key) => {
        if (keyMap[key] !== undefined) {
          const noteIndex = startKey + keyMap[key];
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
  }, [startKey, pressKey, releaseKey]);

  // Enhanced mouse event handling
  useEffect(() => {
    const getKeyIndex = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y) as HTMLElement;
      return element?.dataset.keyIndex ? parseInt(element.dataset.keyIndex) : null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      const keyIndex = getKeyIndex(e.clientX, e.clientY);
      if (keyIndex !== null && !mouseKeyDown.current.has(keyIndex)) {
        mouseKeyDown.current.add(keyIndex);
        requestAnimationFrame(() => pressKey(keyIndex));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDown.current) {
        const keyIndex = getKeyIndex(e.clientX, e.clientY);
        
        // Release keys that are no longer under the mouse
        mouseKeyDown.current.forEach(activeKeyIndex => {
          if (keyIndex !== activeKeyIndex) {
            requestAnimationFrame(() => releaseKey(activeKeyIndex));
            mouseKeyDown.current.delete(activeKeyIndex);
          }
        });
        
        // Press the key under the mouse if it's not already pressed
        if (keyIndex !== null && !mouseKeyDown.current.has(keyIndex)) {
          mouseKeyDown.current.add(keyIndex);
          requestAnimationFrame(() => pressKey(keyIndex));
        }
      }
    };

    const handleMouseUp = () => {
      if (isMouseDown.current) {
        mouseKeyDown.current.forEach((keyIndex) => {
          requestAnimationFrame(() => releaseKey(keyIndex));
        });
        mouseKeyDown.current.clear();
        isMouseDown.current = false;
      }
    };

    // Handle touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        const keyIndex = getKeyIndex(touch.clientX, touch.clientY);
        if (keyIndex !== null) {
          touchRegistry.current.set(touch.identifier, keyIndex);
          requestAnimationFrame(() => pressKey(keyIndex));
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        const newKeyIndex = getKeyIndex(touch.clientX, touch.clientY);
        const oldKeyIndex = touchRegistry.current.get(touch.identifier);
        if (oldKeyIndex !== undefined && newKeyIndex !== null && oldKeyIndex !== newKeyIndex) {
          requestAnimationFrame(() => releaseKey(oldKeyIndex));
          touchRegistry.current.set(touch.identifier, newKeyIndex);
          requestAnimationFrame(() => pressKey(newKeyIndex));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        const keyIndex = touchRegistry.current.get(touch.identifier);
        if (keyIndex !== undefined) {
          touchRegistry.current.delete(touch.identifier);
          requestAnimationFrame(() => releaseKey(keyIndex));
        }
      }
    };

    // Add event listeners
    const piano = pianoRef.current;
    if (piano) {
      piano.style.touchAction = "none";
      
      // Piano element event listeners
      piano.addEventListener("mousedown", handleMouseDown, { passive: false });
      piano.addEventListener("mousemove", handleMouseMove, { passive: false });
      
      // Touch events
      piano.addEventListener("touchstart", handleTouchStart, { passive: false });
      piano.addEventListener("touchmove", handleTouchMove, { passive: false });
      piano.addEventListener("touchend", handleTouchEnd, { passive: false });
      piano.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    }
    
    // Global mouse event listeners to handle cases where mouse is released outside piano
    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp, { passive: false });
    window.addEventListener("mouseleave", handleMouseUp, { passive: false });

    return () => {
      if (piano) {
        piano.style.touchAction = "";
        piano.removeEventListener("mousedown", handleMouseDown);
        piano.removeEventListener("mousemove", handleMouseMove);
        
        piano.removeEventListener("touchstart", handleTouchStart);
        piano.removeEventListener("touchmove", handleTouchMove);
        piano.removeEventListener("touchend", handleTouchEnd);
        piano.removeEventListener("touchcancel", handleTouchEnd);
      }
      
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
      
      // Clean up any pressed keys
      const currentMouseKeys = mouseKeyDown.current;
      currentMouseKeys.forEach(keyIndex => {
        releaseKey(keyIndex);
      });
      currentMouseKeys.clear();
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

  // Generate note color based on position in octave
  function getNoteColor(notePosition: number) {
    const colors = [
      'from-purple-500/40 to-indigo-600/30', // C
      'from-indigo-600/40 to-blue-600/30',   // C#
      'from-blue-500/40 to-cyan-500/30',     // D
      'from-cyan-500/40 to-teal-500/30',     // D#
      'from-teal-500/40 to-green-500/30',    // E
      'from-green-500/40 to-lime-500/30',    // F
      'from-lime-500/40 to-yellow-500/30',   // F#
      'from-yellow-500/40 to-amber-500/30',  // G
      'from-amber-500/40 to-orange-500/30',  // G#
      'from-orange-500/40 to-red-500/30',    // A
      'from-red-500/40 to-pink-500/30',      // A#
      'from-pink-500/40 to-purple-500/30',   // B
    ];
    return colors[notePosition];
  }

  // Get key glow color
  function getGlowColor(notePosition: number, isActive: boolean) {
    if (!isActive) return 'rgba(0, 0, 0, 0)';
    
    const colors = [
      'rgba(168, 85, 247, 0.8)',  // C - purple
      'rgba(79, 70, 229, 0.8)',   // C# - indigo
      'rgba(59, 130, 246, 0.8)',  // D - blue
      'rgba(6, 182, 212, 0.8)',   // D# - cyan
      'rgba(20, 184, 166, 0.8)',  // E - teal
      'rgba(22, 163, 74, 0.8)',   // F - green
      'rgba(132, 204, 22, 0.8)',  // F# - lime
      'rgba(234, 179, 8, 0.8)',   // G - yellow
      'rgba(245, 158, 11, 0.8)',  // G# - amber
      'rgba(249, 115, 22, 0.8)',  // A - orange
      'rgba(239, 68, 68, 0.8)',   // A# - red
      'rgba(236, 72, 153, 0.8)',  // B - pink
    ];
    return colors[notePosition % 12];
  }

  return (
    <div className="h-full w-full flex items-end justify-center p-4 bg-gradient-to-b from-black/5 to-black/20">
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
            background: `radial-gradient(circle at ${50 + Math.sin(glowIntensity * Math.PI * 2) * 15}% ${50 + Math.cos(glowIntensity * Math.PI * 2) * 15}%, rgba(120, 120, 255, 0.3), transparent 70%)`,
            filter: 'blur(40px)',
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
                      ? `linear-gradient(to bottom, ${getGlowColor(notePos, true)} 0%, rgba(255, 255, 255, 0.15) 100%)` 
                      : `linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)`,
                    boxShadow: isActive 
                      ? `0 0 20px ${getGlowColor(notePos, true)}, inset 0 0 10px rgba(255, 255, 255, 0.5)` 
                      : isSuggested
                        ? '0 0 10px rgba(120, 120, 255, 0.4), inset 0 0 5px rgba(120, 120, 255, 0.2)'
                        : 'none'
                  }}
                  animate={{ 
                    y: isActive ? 4 : 0,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  {/* Subtle color gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${noteColor} opacity-${isActive ? 80 : 40}`} />
                  
                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                  
                  {/* Edge highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
                  
                  {/* Key label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white font-medium text-shadow">
                    {keyToNote(keyIndex)}
                  </div>
                  
                  {/* Keyboard shortcut */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/90 text-shadow">
                    {getKeyboardShortcut(keyIndex - startKey)}
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Black keys */}
        <div className="absolute top-0 left-0 right-0 h-[60%]">
          {keys.map(({ keyIndex, isBlackKey, isActive, isSuggested, noteColor }) => {
            if (!isBlackKey) return null;
            const whiteKeysBefore = keys.filter((k) => !k.isBlackKey && k.keyIndex < keyIndex).length;
            const notePos = keyIndex % 12;
            
            return (
              <motion.div
                key={`black-${keyIndex}`}
                data-key-index={keyIndex}
                className="absolute w-[8.5%] h-full rounded-lg cursor-pointer z-20 pointer-events-auto overflow-hidden backdrop-blur-md border border-black/50"
                style={{
                  left: `calc(${whiteKeysBefore * (100 / (keys.length - keys.filter((k) => k.isBlackKey).length))}% - 4.25%)`,
                  background: isActive 
                    ? `linear-gradient(to bottom, ${getGlowColor(notePos, true)} 0%, rgba(0, 0, 0, 0.8) 100%)` 
                    : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.8) 100%)',
                  boxShadow: isActive 
                    ? `0 0 20px ${getGlowColor(notePos, true)}, inset 0 0 10px rgba(255, 255, 255, 0.3)` 
                    : isSuggested
                      ? '0 0 10px rgba(120, 120, 255, 0.4), inset 0 0 5px rgba(120, 120, 255, 0.2)'
                      : '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
                animate={{ 
                  y: isActive ? 4 : 0,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
              >
                {/* Subtle color gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-b ${noteColor} opacity-${isActive ? 60 : 30} mix-blend-overlay`} />
                
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-30" />
                
                {/* Edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                
                {/* Keyboard shortcut */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/80 text-shadow">
                  {getKeyboardShortcut(keyIndex - startKey)}
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
            filter: 'blur(20px)',
            transform: 'translateY(40%)'
          }}
        />
      </div>
    </div>
  );
}

function getKeyboardShortcut(relativeIndex: number): string {
  const shortcuts = [
    "A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J",
    "K", "L", "O", "P", "Z", "X", "C", "V",
  ];
  return relativeIndex >= 0 && relativeIndex < shortcuts.length ? shortcuts[relativeIndex] : "";
}

// Add a global style for text shadow
const style = document.createElement('style');
style.textContent = `
  .text-shadow {
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }
`;
document.head.appendChild(style);