"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePianoStore } from "@/store/piano-store";

export default function FingerAnimations() {
  const { activeKeys, startKey, visibleKeys } = usePianoStore();

  // Filter only the visible active keys
  const visibleActiveKeys = Array.from(activeKeys).filter(
    (key) => key >= startKey && key < startKey + visibleKeys
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {visibleActiveKeys.map((keyIndex) => {
          const relativeIndex = keyIndex - startKey;
          const isBlackKey = [1, 3, 6, 8, 10].includes(keyIndex % 12);
          const fingerIndex = getFingerForKey(relativeIndex, keyIndex);
          const position = getKeyPosition(relativeIndex, isBlackKey, visibleKeys, startKey);

          return (
            <motion.div
              key={keyIndex}
              initial={{ y: -120, opacity: 0, rotate: getFingerAngle(fingerIndex, isBlackKey) }}
              animate={{
                y: isBlackKey ? 25 : 20,
                opacity: 1,
                rotate: getFingerAngle(fingerIndex, isBlackKey)
              }}
              exit={{ y: -90, opacity: 0, rotate: getFingerAngle(fingerIndex, isBlackKey) }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: isBlackKey ? 22 : 25,
                mass: fingerIndex === 0 ? 1.2 : 1 // Thumb is slightly heavier
              }}
              className="absolute z-30"
              style={{
                left: `${position.x}%`,
                bottom: `${position.y}%`,
                transformOrigin: "bottom center",
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
              }}
            >
              <HumanFingerWithGlove 
                index={fingerIndex} 
                isBlackKey={isBlackKey} 
                isPressed={true}
                noteIndex={keyIndex}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Function to determine appropriate finger angle
function getFingerAngle(fingerIndex: number, isBlackKey: boolean): number {
  // Natural hand curvature makes different fingers approach keys at different angles
  const baseAngles = [15, 8, 0, -8, -15]; // Thumb curves inward, pinky outward
  
  // Adjust angles further for black keys
  const angleAdjustment = isBlackKey ? 5 : 0;
  
  return baseAngles[fingerIndex] + angleAdjustment;
}

// Human finger with glove component
function HumanFingerWithGlove({ 
  index, 
  // isBlackKey,
  isPressed,
  noteIndex
}: { 
  index: number; 
  isBlackKey: boolean;
  isPressed: boolean;
  noteIndex: number;
}) {
  // Different dimensions based on finger type
  const isThumb = index === 0;
  const fingerWidth = isThumb ? 32 : [28, 30, 28, 24][index - 1];
  const fingerLength = isThumb ? 75 : [90, 95, 90, 80][index - 1];
  
  // Get color variations based on note (creates a slight rainbow effect across the keyboard)
  const hue = (noteIndex * 8) % 360;
  
  // Glove color properties - using a very slight hue variation for visual interest
  const gloveColor = `hsl(${hue}, 8%, 14%)`; // Dark glove base color
  const gloveHighlight = `hsl(${hue}, 10%, 22%)`; // Slightly lighter for highlights
  const gloveShadow = `hsl(${hue}, 12%, 10%)`; // Slightly darker for shadows
  const gloveAccent = `hsl(${hue}, 25%, 30%)`; // Accent color for seams
  
  // Skin tone shown at glove opening (wrist)
  const skinTone = "#e0c8b0";
  
  // Slightly adjust styles based on key press state
  const pressIntensity = isPressed ? 1 : 0.8;
  
  return (
    <div className="flex flex-col items-center">
      <svg
        width={fingerWidth}
        height={fingerLength}
        viewBox={`0 0 ${fingerWidth} ${fingerLength}`}
      >
        {/* Shadow under the finger */}
        <ellipse 
          cx={fingerWidth / 2} 
          cy={fingerLength - 2} 
          rx={fingerWidth / 2.5} 
          ry={3} 
          fill="rgba(0,0,0,0.2)"
          filter="blur(1px)"
        />
        
        {/* Wrist/arm section (showing skin) */}
        <path
          d={`
            M${fingerWidth * 0.25} ${fingerLength - 10}
            Q${fingerWidth * 0.5} ${fingerLength - 8} ${fingerWidth * 0.75} ${fingerLength - 10}
            L${fingerWidth * 0.8} ${fingerLength}
            L${fingerWidth * 0.2} ${fingerLength}
            Z
          `}
          fill={skinTone}
          stroke="#d0b8a0"
          strokeWidth="0.5"
        />

        {/* Main finger shape (glove) */}
        <path
          d={`
            M${fingerWidth * 0.3} ${fingerLength * 0.05} 
            Q${fingerWidth * 0.18} ${fingerLength * 0.2} ${fingerWidth * 0.2} ${fingerLength * 0.5} 
            Q${fingerWidth * 0.22} ${fingerLength * 0.7} ${fingerWidth * 0.25} ${fingerLength - 12} 
            Q${fingerWidth * 0.5} ${fingerLength - 10} ${fingerWidth * 0.75} ${fingerLength - 12} 
            Q${fingerWidth * 0.78} ${fingerLength * 0.7} ${fingerWidth * 0.8} ${fingerLength * 0.5} 
            Q${fingerWidth * 0.82} ${fingerLength * 0.2} ${fingerWidth * 0.7} ${fingerLength * 0.05} 
            Q${fingerWidth * 0.5} ${fingerLength * 0.0} ${fingerWidth * 0.3} ${fingerLength * 0.05}
          `}
          fill={gloveColor}
          stroke="#1a1a1a"
          strokeWidth="0.8"
        />
        
        {/* Fingertip detail - slightly compressed when pressing */}
        <path
          d={`
            M${fingerWidth * 0.3} ${fingerLength * (isPressed ? 0.05 : 0.06)}
            Q${fingerWidth * 0.5} ${fingerLength * (isPressed ? 0.02 : 0.03)} ${fingerWidth * 0.7} ${fingerLength * (isPressed ? 0.05 : 0.06)}
            Q${fingerWidth * 0.5} ${fingerLength * (isPressed ? 0.09 : 0.1)} ${fingerWidth * 0.3} ${fingerLength * (isPressed ? 0.05 : 0.06)}
          `}
          fill={gloveHighlight}
          strokeWidth="0.5"
        />
        
        {/* Finger bend/knuckle details */}
        <path
          d={`
            M${fingerWidth * 0.25} ${fingerLength * 0.3}
            Q${fingerWidth * 0.5} ${fingerLength * 0.32} ${fingerWidth * 0.75} ${fingerLength * 0.3}
          `}
          fill="none"
          stroke={gloveHighlight}
          strokeWidth="1"
          opacity="0.7"
        />
        <path
          d={`
            M${fingerWidth * 0.25} ${fingerLength * 0.6}
            Q${fingerWidth * 0.5} ${fingerLength * 0.62} ${fingerWidth * 0.75} ${fingerLength * 0.6}
          `}
          fill="none"
          stroke={gloveHighlight}
          strokeWidth="0.8"
          opacity="0.6"
        />
        
        {/* Glove seam - different for thumb vs fingers */}
        <path
          d={isThumb ? 
            `M${fingerWidth * 0.3} ${fingerLength * 0.2}
             L${fingerWidth * 0.7} ${fingerLength * 0.2}` :
            `M${fingerWidth * 0.5} ${fingerLength * 0.1}
             L${fingerWidth * 0.5} ${fingerLength * 0.7}`
          }
          fill="none"
          stroke={gloveAccent}
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Glove texture/highlights */}
        <path
          d={`
            M${fingerWidth * 0.3} ${fingerLength * 0.2}
            Q${fingerWidth * 0.35} ${fingerLength * 0.5} ${fingerWidth * 0.3} ${fingerLength * 0.8}
          `}
          fill="none"
          stroke={gloveHighlight}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.1"
        />
        <path
          d={`
            M${fingerWidth * 0.7} ${fingerLength * 0.2}
            Q${fingerWidth * 0.65} ${fingerLength * 0.5} ${fingerWidth * 0.7} ${fingerLength * 0.8}
          `}
          fill="none"
          stroke={gloveShadow}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.1"
        />
        
        {/* Glove wrist detail - elegant piping on the glove */}
        <path
          d={`
            M${fingerWidth * 0.2} ${fingerLength - 14}
            Q${fingerWidth * 0.5} ${fingerLength - 12} ${fingerWidth * 0.8} ${fingerLength - 14}
          `}
          fill="none"
          stroke={gloveAccent}
          strokeWidth="1"
          opacity={pressIntensity}
        />
        <path
          d={`
            M${fingerWidth * 0.2} ${fingerLength - 11}
            Q${fingerWidth * 0.5} ${fingerLength - 9} ${fingerWidth * 0.8} ${fingerLength - 11}
          `}
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.5"
          opacity={pressIntensity * 0.7}
        />
        
        {/* Little glove wrinkles - more pronounced when pressing */}
        {Array.from({ length: 4 }).map((_, i) => (
          <path
            key={i}
            d={`
              M${fingerWidth * (0.3 + i * 0.1)} ${fingerLength * (0.13 + i * 0.06)}
              Q${fingerWidth * (0.4 + i * 0.08)} ${fingerLength * (0.16 + i * 0.06)} ${fingerWidth * (0.45 + i * 0.1)} ${fingerLength * (0.15 + i * 0.06)}
            `}
            fill="none"
            stroke={i % 2 === 0 ? gloveHighlight : gloveShadow}
            strokeWidth="0.5"
            opacity={isPressed ? 0.7 : 0.4}
          />
        ))}
        
        {/* Pressure area where finger touches key - more visible when pressed */}
        <ellipse 
          cx={fingerWidth / 2} 
          cy={fingerLength * 0.04} 
          rx={fingerWidth * 0.28} 
          ry={fingerLength * 0.04}
          fill={isPressed ? gloveAccent : "none"}
          fillOpacity={isPressed ? 0.2 : 0}
          stroke={gloveHighlight}
          strokeWidth="0.8"
          opacity={isPressed ? 0.9 : 0.5}
        />
        
        {/* Add slight shine to glove material */}
        <ellipse
          cx={fingerWidth * 0.4}
          cy={fingerLength * 0.3}
          rx={fingerWidth * 0.1}
          ry={fingerLength * 0.1}
          fill="white"
          opacity="0.05"
        />
      </svg>
    </div>
  );
}

// Helper function to determine which finger to use for a key
function getFingerForKey(relativeIndex: number, absoluteIndex: number): number {
  const cMajorFingering = {
    39: 0, // C4: Thumb
    40: 1, // C#4: Index
    41: 1, // D4: Index
    42: 2, // D#4: Middle
    43: 2, // E4: Middle
    44: 3, // F4: Ring
    45: 3, // F#4: Ring
    46: 4, // G4: Pinky
    47: 4, // G#4: Pinky
    48: 4, // A4: Pinky
    49: 3, // A#4: Ring
    50: 2, // B4: Middle
    51: 1, // C5: Index
  };

  if (absoluteIndex >= 39 && absoluteIndex <= 51 && cMajorFingering[absoluteIndex] !== undefined) {
    return cMajorFingering[absoluteIndex];
  }

  // Improved fingering map for more natural playing
  const fingerMap = [0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 3, 2];
  return fingerMap[relativeIndex % 12];
}

// Helper function to calculate key position aligned with PianoKeyboard.tsx
function getKeyPosition(relativeIndex: number, isBlackKey: boolean, visibleKeys: number, startKey: number) {
  // Calculate number of white keys visible
  const whiteKeysCount = visibleKeys - [1, 3, 6, 8, 10].filter((i) => 
    (startKey + i) % 12 < visibleKeys
  ).length;
  
  let x;

  if (isBlackKey) {
    // Count white keys before this position
    const whiteKeysBefore = Array.from({ length: relativeIndex }, (_, i) => startKey + i).filter(
      (key) => ![1, 3, 6, 8, 10].includes(key % 12)
    ).length;
    
    // Position black key finger slightly to the right of the black key center
    x = (whiteKeysBefore * (100 / whiteKeysCount)) - 3.5;
  } else {
    // Count to find position of this white key
    const whiteKeyIndex = Array.from({ length: relativeIndex + 1 }, (_, i) => startKey + i).filter(
      (key) => ![1, 3, 6, 8, 10].includes(key % 12)
    ).length - 1;
    
    // Center on white key
    x = whiteKeyIndex * (100 / whiteKeysCount) + (50 / whiteKeysCount) - 2;
  }

  // Adjust height based on key type - fingers should descend from higher up for black keys
  const y = isBlackKey ? 75 : 55;

  return { x, y };
}