"use client";

import { useEffect, useRef } from "react";
import { usePianoStore } from "@/store/piano-store";

interface NoteParticle {
  id: string;
  keyIndex: number;
  x: number;
  y: number;
  velocityY: number;
  opacity: number;
  color: string;
  size: number;
  twinklePhase: number;
}

export default function NoteTrail() {
  const { activeKeys, startKey, visibleKeys } = usePianoStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<NoteParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const pianoContainerRef = useRef<HTMLDivElement>(null);
  const lastParticleTimeRef = useRef<Map<number, number>>(new Map());

  // Calculate key positions
  const keyPositions = useRef<Map<number, { x: number; width: number; top: number }>>(new Map());

  // Color theme matching PianoKeyboard
  const getNoteColor = (notePosition: number) => {
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
    return colors[notePosition % 12];
  };

  // Update key positions
  useEffect(() => {
    const updateKeyPositions = () => {
      keyPositions.current.clear();
      const pianoKeys = document.querySelectorAll("[data-key-index]");
      pianoKeys.forEach((key) => {
        const keyIndex = parseInt(key.getAttribute("data-key-index") || "0");
        const rect = key.getBoundingClientRect();
        const containerRect = pianoContainerRef.current?.getBoundingClientRect();
        if (containerRect) {
          keyPositions.current.set(keyIndex, {
            x: rect.left - containerRect.left + rect.width / 2,
            width: rect.width,
            top: rect.top - containerRect.top,
          });
        }
      });
    };

    updateKeyPositions();
    window.addEventListener("resize", updateKeyPositions);

    return () => {
      window.removeEventListener("resize", updateKeyPositions);
    };
  }, [startKey, visibleKeys]);

  // Particle generation and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      const container = pianoContainerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight * 2;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate particles
    const updateParticles = () => {
      const now = performance.now();
      activeKeys.forEach((keyIndex) => {
        const pos = keyPositions.current.get(keyIndex);
        if (!pos) return;

        // Spawn every 200ms
        const lastSpawn = lastParticleTimeRef.current.get(keyIndex) || 0;
        if (now - lastSpawn > 200) {
          const particleCount = 1 + Math.floor(Math.random() * 2); // 1-2 particles
          for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push({
              id: `${keyIndex}-${now}-${i}`,
              keyIndex,
              x: pos.x + (Math.random() - 0.5) * pos.width * 0.3,
              y: pos.top,
              velocityY: -(4 + Math.random() * 2), // Slow rise
              opacity: 1,
              color: getNoteColor(keyIndex % 12),
              size: 2 + Math.random() * 2, // Small star size
              twinklePhase: Math.random() * Math.PI * 2,
            });
          }
          lastParticleTimeRef.current.set(keyIndex, now);
        }
      });

      lastParticleTimeRef.current.forEach((_, keyIndex) => {
        if (!activeKeys.has(keyIndex)) {
          lastParticleTimeRef.current.delete(keyIndex);
        }
      });
    };

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.y += particle.velocityY;
        const twinkle = 1 + Math.sin(particle.twinklePhase + performance.now() * 0.008) * 0.4;
        particle.twinklePhase += 0.1;
        particle.size = (2 + Math.random() * 2) * twinkle * 0.8;

        // Remove particles at the top of the page
        if (particle.y <= 0) return false;

        // Star core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace("0.8", particle.opacity.toString());
        ctx.fill();

        // Star cross pattern
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.size * 2, particle.y);
        ctx.lineTo(particle.x + particle.size * 2, particle.y);
        ctx.moveTo(particle.x, particle.y - particle.size * 2);
        ctx.lineTo(particle.x, particle.y + particle.size * 2);
        ctx.strokeStyle = particle.color.replace("0.8", (particle.opacity * 0.5).toString());
        ctx.lineWidth = particle.size * 0.5;
        ctx.stroke();

        // Outer glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace("0.8", (particle.opacity * 0.2).toString());
        ctx.fill();

        return true;
      });

      updateParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeKeys, startKey, visibleKeys]);

  return (
    <div
      ref={pianoContainerRef}
      className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none overflow-visible"
      style={{ zIndex: 100 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute left-0 right-0 top-0 bottom-0"
        style={{
          background: "transparent",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}