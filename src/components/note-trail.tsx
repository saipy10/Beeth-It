"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePianoStore } from "@/store/piano-store";
import { debounce } from "lodash";

interface NoteTile {
  id: string;
  keyIndex: number;
  x: number;
  y: number;
  width: number;
  color: string;
  glowIntensity: number;
  startTime: number;
  releaseTime: number | null;
  height: number;
  velocity: number;
  releasedYVelocity?: number;
  opacity: number;
  glowSize: number;
  initialY: number;
  active: boolean; // Track if this note is currently active
}

interface VisualizerSettings {
  trailSpeed: number;
  glowIntensity: number;
  fadeRate: number;
  particleEffect: boolean;
  minimumTileHeight: number;
}

export default function NoteTrail() {
  const { activeKeys, startKey, visibleKeys, velocity = new Map() } = usePianoStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<NoteTile[]>([]);
  const particlesRef = useRef<Array<{x: number, y: number, size: number, color: string, vx: number, vy: number, opacity: number}>>([]);
  const animationFrameRef = useRef<number | null>(null);
  const pianoContainerRef = useRef<HTMLDivElement>(null);
  const lastFrameTime = useRef<number>(0);
  const previousActiveKeys = useRef<Set<number>>(new Set());
  const keyPositions = useRef<Map<number, { x: number; width: number; top: number; isBlack: boolean }>>(new Map());
  
  // Settings
  const [settings] = useState<VisualizerSettings>({
    trailSpeed: 0.18,
    glowIntensity: 0.7,
    fadeRate: 0.01,
    particleEffect: true,
    minimumTileHeight: 20,
  });

  const getNoteColor = useCallback((notePosition: number, isBlackKey: boolean) => {
    const colorPalettes = {
      standard: [
        "#9966FF", "#4338CA", "#2563EB", "#0891B2",
        "#0D9488", "#15803D", "#65A30D", "#CA8A04",
        "#D97706", "#EA580C", "#DC2626", "#DB2777"
      ],
      vibrant: [
        "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", 
        "#84CC16", "#EAB308", "#F59E0B", "#F97316", 
        "#EF4444", "#EC4899", "#A855F7", "#6366F1"
      ]
    };
    
    const palette = isBlackKey ? colorPalettes.vibrant : colorPalettes.standard;
    return palette[notePosition % 12];
  }, []);

  const updateKeyPositions = useCallback(
    debounce(() => {
      keyPositions.current.clear();
      document.querySelectorAll("[data-key-index]").forEach((key) => {
        const keyIndex = parseInt(key.getAttribute("data-key-index") || "0");
        const rect = key.getBoundingClientRect();
        const containerRect = pianoContainerRef.current?.getBoundingClientRect();
        const isBlack = key.classList.contains("black-key") || key.getAttribute("data-is-black") === "true";
        
        if (containerRect) {
          keyPositions.current.set(keyIndex, {
            x: rect.left - containerRect.left + rect.width / 2,
            width: rect.width,
            top: rect.top - containerRect.top,
            isBlack
          });
        }
      });
    }, 100),
    []
  );

  const createParticles = useCallback((x: number, y: number, color: string, count: number, velocity: number) => {
    if (!settings.particleEffect) return;
    
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10, // Small variation around the point
        y: y,
        size: 1 + Math.random() * 3,
        color: color,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 3 + velocity * 2), // Higher velocity for harder keypress
        opacity: 0.8 + Math.random() * 0.2
      });
    }
  }, [settings.particleEffect]);

  // Initialize key positions
  useEffect(() => {
    updateKeyPositions();
    window.addEventListener("resize", updateKeyPositions);
    return () => {
      window.removeEventListener("resize", updateKeyPositions);
      updateKeyPositions.cancel();
    };
  }, [startKey, visibleKeys, updateKeyPositions]);

  // Handle key changes
  useEffect(() => {
    const now = performance.now();
    
    const newlyPressedKeys = Array.from(activeKeys).filter(key => !previousActiveKeys.current.has(key));
    const releasedKeys = Array.from(previousActiveKeys.current).filter(key => !activeKeys.has(key));
    
    newlyPressedKeys.forEach(keyIndex => {
      const pos = keyPositions.current.get(keyIndex);
      if (!pos) return;
      
      const keyVelocity = velocity.get(keyIndex) || 0.5 + Math.random() * 0.5;
      const tileWidth = pos.width * 0.6;
      
      const tile: NoteTile = {
        id: `${keyIndex}-${now}`,
        keyIndex,
        x: pos.x - tileWidth / 2,
        y: pos.top,
        initialY: pos.top,
        width: tileWidth,
        color: getNoteColor(keyIndex % 12, pos.isBlack),
        glowIntensity: settings.glowIntensity * (0.7 + keyVelocity * 0.3),
        velocity: keyVelocity,
        startTime: now,
        releaseTime: null,
        height: 0,
        opacity: 1,
        glowSize: 10 + keyVelocity * 5,
        active: true
      };
      
      tilesRef.current.push(tile);
      
      createParticles(tile.x + tile.width / 2, tile.initialY, tile.color, Math.floor(3 + tile.velocity * 5), tile.velocity);
    });
    
    releasedKeys.forEach(keyIndex => {
      tilesRef.current.forEach(tile => {
        if (tile.keyIndex === keyIndex && tile.active && tile.releaseTime === null) {
          tile.releaseTime = now;
          tile.active = false;
          
          if (tile.height < settings.minimumTileHeight) {
            tile.height = settings.minimumTileHeight;
          }
          
          createParticles(tile.x + tile.width / 2, tile.y, tile.color, Math.floor(5 + tile.velocity * 10), tile.velocity);
        }
      });
    });
    
    previousActiveKeys.current = new Set(activeKeys);
  }, [activeKeys, getNoteColor, createParticles, settings, velocity]);

  // Canvas drawing and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      if (pianoContainerRef.current) {
        const { clientWidth, clientHeight } = pianoContainerRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = clientWidth * dpr;
        canvas.height = clientHeight * dpr;
        canvas.style.width = `${clientWidth}px`;
        canvas.style.height = `${clientHeight}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = (timestamp: number) => {
      if (!ctx || !canvas) return;
      
      const deltaTime = lastFrameTime.current ? (timestamp - lastFrameTime.current) / 16.667 : 1;
      lastFrameTime.current = timestamp;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      tilesRef.current.sort((a, b) => a.startTime - b.startTime);

      tilesRef.current = tilesRef.current.filter((tile) => {
        if (tile.releaseTime === null) {
          const delta = timestamp - tile.startTime;
          const newHeight = delta * settings.trailSpeed * (0.8 + tile.velocity * 0.4);
          tile.height = newHeight;
          tile.y = tile.initialY - tile.height;
        } else {
          tile.releasedYVelocity ??= 1 + tile.velocity * 2;
          tile.y -= tile.releasedYVelocity * deltaTime;
          tile.opacity -= settings.fadeRate * deltaTime;
          tile.glowSize *= 0.99;
        }

        if (tile.opacity <= 0 || tile.y + tile.height < 0) {
          return false;
        }

        ctx.save();
        ctx.globalAlpha = tile.opacity;

        const gradient = ctx.createLinearGradient(tile.x, tile.y + tile.height, tile.x, tile.y);
        gradient.addColorStop(0, tile.color + "00");
        gradient.addColorStop(0.2, tile.color + "30");
        gradient.addColorStop(0.7, tile.color + "AA");
        gradient.addColorStop(1, tile.color + "FF");

        ctx.fillStyle = gradient;
        ctx.shadowColor = tile.color;
        ctx.shadowBlur = tile.glowSize * tile.glowIntensity;

        const radius = Math.min(tile.width / 2, 4);
        roundRect(ctx, tile.x, tile.y, tile.width, tile.height, radius);
        ctx.restore();

        return true;
      });

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        particle.size *= 0.97;
        particle.opacity *= 0.95;

        if (particle.opacity < 0.05 || particle.size < 0.2) return false;

        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    function roundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [settings]);

  return (
    <div
      ref={pianoContainerRef}
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 100 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
