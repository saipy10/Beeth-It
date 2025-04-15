"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Keyboard, Settings, X } from "lucide-react";
import { keyToNote, usePianoStore } from "@/store/piano-store";
import { debounce } from "lodash";

const OptionsTab = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { startKey, visibleKeys, setStartKey, setVisibleKeys } = usePianoStore();

  const expandRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleKeysChange = useCallback(
    debounce((value: string | number) => {
      const newValue = Math.max(12, Math.min(88, parseInt(value.toString()) || 13));
      setVisibleKeys(newValue);
    }, 100),
    [setVisibleKeys]
  );

  const handleKeyboardStartChange = useCallback(
    debounce((value: string) => {
      const newValue = Math.max(0, Math.min(88 - visibleKeys, parseInt(value) || 60));
      setStartKey(newValue);
    }, 100),
    [setStartKey, visibleKeys]
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isExpanded &&
        expandRef.current &&
        !expandRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="absolute top-4 left-4 z-50">
      <motion.div
        className="relative"
        animate={{ scale: isExpanded ? 0 : 1, opacity: isExpanded ? 0 : 1 }}
        ref={buttonRef}
      >
        <button
          onClick={toggleExpand}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-12 h-12 rounded-full bg-gray-900/60 backdrop-blur-md text-white flex items-center justify-center border border-purple-500/30 transition-all hover:bg-gray-900/80 hover:border-purple-400/50"
        >
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0.6,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-6 h-6 text-purple-300" />
          </motion.div>
        </button>
      </motion.div>

      <motion.div
        ref={expandRef}
        className="absolute top-0 left-0 bg-gray-900/95 text-white rounded-xl backdrop-blur-lg border border-purple-500/40 shadow-2xl overflow-hidden"
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{
          width: isExpanded ? 320 : 0,
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-purple-200 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Piano Settings
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 rounded-full bg-purple-900/60 flex items-center justify-center hover:bg-purple-800/80 transition-colors"
            >
              <X className="w-4 h-4 text-purple-200" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center">
              <Keyboard className="w-4 h-4 mr-2 text-purple-400" />
              Keyboard Size
            </label>

            <div className="relative mt-3 bg-gray-800/80 p-3 rounded-lg border border-purple-500/30">
              <div className="flex items-center mb-4">
                <span className="text-xs font-medium text-purple-300 w-24">Visible Keys:</span>
                <div className="flex items-center flex-1">
                  <motion.button
                    onClick={() => handleKeysChange(visibleKeys - 1)}
                    className="w-5 h-5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-500/50 flex items-center justify-center hover:bg-purple-800/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm font-semibold">-</span>
                  </motion.button>
                  <input
                    type="range"
                    min="12"
                    max="88"
                    value={visibleKeys}
                    onChange={(e) => handleKeysChange(e.target.value)}
                    className="mx-2 flex-1 h-1 bg-purple-900/60 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: "linear-gradient(90deg, rgba(124, 58, 237, 0.4), rgba(124, 58, 237, 0.15))",
                    }}
                  />
                  <motion.button
                    onClick={() => handleKeysChange(visibleKeys + 1)}
                    className="w-5 h-5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-500/50 flex items-center justify-center hover:bg-purple-800/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm font-semibold">+</span>
                  </motion.button>
                </div>
                <span className="text-xs text-purple-300 ml-3 w-8 text-right">{visibleKeys}</span>
              </div>

              <div className="flex items-center">
                <span className="text-xs font-medium text-purple-300 w-24">Start Key:</span>
                <div className="flex items-center flex-1">
                  <motion.button
                    onClick={() => handleKeyboardStartChange((startKey - 1).toString())}
                    className="w-5 h-5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-500/50 flex items-center justify-center hover:bg-purple-800/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm font-semibold">-</span>
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max={88 - visibleKeys}
                    value={startKey}
                    onChange={(e) => handleKeyboardStartChange(e.target.value)}
                    className="mx-2 flex-1 h-1 bg-purple-900/60 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: "linear-gradient(90deg, rgba(124, 58, 237, 0.4), rgba(124, 58, 237, 0.15))",
                    }}
                  />
                  <motion.button
                    onClick={() => handleKeyboardStartChange((startKey + 1).toString())}
                    className="w-5 h-5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-500/50 flex items-center justify-center hover:bg-purple-800/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm font-semibold">+</span>
                  </motion.button>
                </div>
                <span className="text-xs text-purple-300 ml-3 w-8 text-right">
                  {keyToNote(startKey)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OptionsTab;