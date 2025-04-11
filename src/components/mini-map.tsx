"use client";

import type React from "react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePianoStore } from "@/store/piano-store";

export default function MiniMap() {
  const { startKey, visibleKeys, setStartKey, activeKeys } = usePianoStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalKeys = 88;
  const windowWidthPercentage = (visibleKeys / totalKeys) * 100;
  const windowPositionPercentage = (startKey / totalKeys) * 100;

  // Handle click on the mini-map
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickPositionPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    const newStartKey = Math.floor((clickPositionPercentage / 100) * totalKeys);
    const maxStartKey = totalKeys - visibleKeys;
    const clampedStartKey = Math.max(0, Math.min(newStartKey, maxStartKey));
    setStartKey(clampedStartKey);
  };

  // Handle drag
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dragPositionPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    const newStartKey = Math.floor((dragPositionPercentage / 100) * totalKeys);
    const maxStartKey = totalKeys - visibleKeys;
    const clampedStartKey = Math.max(0, Math.min(newStartKey, maxStartKey));
    setStartKey(clampedStartKey);
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative h-10 w-full bg-gradient-to-b from-black/20 to-gray-900/20 rounded-lg overflow-hidden cursor-pointer backdrop-blur-sm shadow-md border border-purple-900/30"
      onClick={handleClick}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      initial={{ opacity: 0.1 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Piano keys representation */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: totalKeys }).map((_, i) => {
          const isBlackKey = [1, 3, 6, 8, 10].includes(i % 12);
          const isC = i % 12 === 0;
          const isMiddleC = i === 39; // C4
          const isActive = activeKeys.has(i);

          return (
            <div
              key={i}
              className={`
                h-full flex-1 border-r border-black/10
                ${isBlackKey ? "bg-gray-700/50" : "bg-gray-300/50"}
                ${isC ? "border-l border-l-purple-500/50" : ""}
                ${isMiddleC ? "bg-purple-300/70" : ""}
                ${isActive ? "bg-purple-500/80" : ""}
              `}
              style={{ minWidth: "1px" }}
            />
          );
        })}
      </div>

      {/* Visible window indicator */}
      <motion.div
        className="absolute top-0 bottom-0 bg-purple-500/50 border-2 border-purple-400 rounded-md shadow-glow"
        style={{
          width: `${windowWidthPercentage}%`,
          left: `${windowPositionPercentage}%`,
        }}
        onMouseDown={handleDragStart}
        whileHover={{ backgroundColor: "rgba(168, 85, 247, 0.7)" }}
        whileTap={{ backgroundColor: "rgba(168, 85, 247, 0.9)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* Key markers */}
      <div className="absolute bottom-0 w-full flex justify-between px-2 text-[6px] text-purple-200/70">
        <span>A0</span>
        <span>C4</span>
        <span>C8</span>
      </div>
    </motion.div>
  );
}