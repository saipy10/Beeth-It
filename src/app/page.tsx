"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePianoStore } from "@/store/piano-store";
import PianoKeyboard from "@/components/piano-keyboard";
// import MiniMap from "@/components/mini-map";
// import FingerAnimations from "@/components/finger-animations";
// import KeySuggestions from "@/components/key-suggestions";
// import DemoPlayer from "@/components/demo-player";
import { motion } from "framer-motion";
import NoteTrail from "@/components/note-trail";
// import DemoPlayer from "@/components/demo-player";
// import OptionsTab from "@/components/options-tab"; // Import the new component

// Dynamically import SpaceBackground
const SpaceBackground = dynamic(() => import("@/components/space-background"), {
  ssr: false,
  loading: () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-black to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  ),
});

export default function Home() {
  const { initAudio } = usePianoStore();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  return (
    <main className="relative flex flex-col h-screen w-full overflow-hidden bg-black text-white">
      <NoteTrail />
      {/* Space Background */}
      <SpaceBackground />
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Title and Description */}
        <motion.div
          className="p-6 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold text-purple-300 mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Beeth-It
          </h1>
          <p className="text-purple-200/80 max-w-md mx-auto text-sm">
            Play the piano among the stars. Use your mouse or keyboard to explore the cosmos of sound.
          </p>
        </motion.div>

        {/* Piano Interface */}
        <div className="flex-1 flex flex-col relative">
          {/* Mini Map - Floating above piano */}
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1/2 z-20"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* <MiniMap /> */}
          </motion.div>

          {/* Key Suggestions */}
          <div className="h-16 px-4 mt-12">
            {/* <KeySuggestions /> */}
          </div>

          {/* Piano Keyboard */}
          <div className="flex-1 relative">
            <PianoKeyboard />
            {/* <FingerAnimations /> */}
          </div>
        </div>
        {/* <DemoPlayer/> */}
      </div>
    </main>
  );
}