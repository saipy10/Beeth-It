// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Switch } from "@/components/ui/switch"

// // Waveform selector component
// export function WaveformSelector({
//   value,
//   onChange,
// }: {
//   value: "sine" | "square" | "triangle" | "sawtooth"
//   onChange: (value: "sine" | "square" | "triangle" | "sawtooth") => void
// }) {
//   const waveforms = [
//     { id: "sine", label: "Sine", icon: "~" },
//     { id: "square", label: "Square", icon: "⊓⊔" },
//     { id: "triangle", label: "Triangle", icon: "△" },
//     { id: "sawtooth", label: "Sawtooth", icon: "⋀⋁" },
//   ] as const

//   return (
//     <div className="grid grid-cols-4 gap-2">
//       {waveforms.map((waveform) => (
//         <button
//           key={waveform.id}
//           className={`
//             p-3 rounded-lg flex flex-col items-center justify-center transition-colors
//             ${value === waveform.id ? "bg-purple-600 text-white" : "bg-black/20 text-purple-300 hover:bg-purple-900/50"}
//           `}
//           onClick={() => onChange(waveform.id)}
//         >
//           <span className="text-xl mb-1">{waveform.icon}</span>
//           <span className="text-xs">{waveform.label}</span>
//         </button>
//       ))}
//     </div>
//   )
// }

// // Knob component for circular controls
// export function Knob({
//   value,
//   min,
//   max,
//   onChange,
//   size = 60,
// }: {
//   value: number
//   min: number
//   max: number
//   onChange: (value: number) => void
//   size?: number
// }) {
//   const [isDragging, setIsDragging] = useState(false)
//   const [startY, setStartY] = useState(0)
//   const [startValue, setStartValue] = useState(0)

//   // Calculate rotation angle based on value
//   const range = max - min
//   const percentage = (value - min) / range
//   const angle = percentage * 270 - 135 // -135 to 135 degrees

//   // Handle mouse/touch events
//   const handleMouseDown = (e: React.MouseEvent) => {
//     setIsDragging(true)
//     setStartY(e.clientY)
//     setStartValue(value)

//     // Add document-level event listeners
//     document.addEventListener("mousemove", handleMouseMove)
//     document.addEventListener("mouseup", handleMouseUp)
//   }

//   const handleMouseMove = (e: MouseEvent) => {
//     if (!isDragging) return

//     // Calculate new value based on vertical drag distance
//     const deltaY = startY - e.clientY
//     const deltaValue = (deltaY / 100) * range
//     const newValue = Math.min(max, Math.max(min, startValue + deltaValue))

//     onChange(newValue)
//   }

//   const handleMouseUp = () => {
//     setIsDragging(false)

//     // Remove document-level event listeners
//     document.removeEventListener("mousemove", handleMouseMove)
//     document.removeEventListener("mouseup", handleMouseUp)
//   }

//   // Clean up event listeners on unmount
//   useEffect(() => {
//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove)
//       document.removeEventListener("mouseup", handleMouseUp)
//     }
//   }, [])

//   return (
//     <div
//       className={`relative cursor-pointer ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
//       style={{ width: size, height: size }}
//       onMouseDown={handleMouseDown}
//     >
//       {/* Knob background */}
//       <div className="absolute inset-0 rounded-full bg-black/40 border border-purple-500/30" />

//       {/* Knob indicator */}
//       <div
//         className="absolute top-1/2 left-1/2 w-1 h-1/3 bg-purple-400 rounded-full origin-bottom"
//         style={{
//           transform: `translate(-50%, -100%) rotate(${angle}deg)`,
//         }}
//       />

//       {/* Center dot */}
//       <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-300 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
//     </div>
//   )
// }

// // Toggle switch component
// export function ToggleSwitch({
//   checked,
//   onChange,
// }: {
//   checked: boolean
//   onChange: (checked: boolean) => void
// }) {
//   return <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-purple-600" />
// }
