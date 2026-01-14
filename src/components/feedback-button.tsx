"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function FeedbackButton() {
  return (
    <motion.a
      href="https://forms.gle/YOUR_GOOGLE_FORM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute top-6 right-6 z-30"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <button
        className="
          group flex items-center gap-2
          px-4 py-2 rounded-full
          bg-white/10 backdrop-blur-md
          border border-purple-400/30
          text-purple-200 text-sm font-medium
          hover:bg-purple-500/20 hover:border-purple-400
          transition-all duration-300
          shadow-lg shadow-purple-500/30
        "
        title="Send feedback to improve Beeth-It"
      >
        <MessageSquare
          size={16}
          className="text-purple-300 group-hover:scale-110 transition-transform"
        />
        Feedback
      </button>
    </motion.a>
  );
}
