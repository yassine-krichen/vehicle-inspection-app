"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car } from "lucide-react"

export type TirePosition = "LF" | "LR" | "RF" | "RR"

interface TireGridProps {
  values: Record<TirePosition, string>
  onChange: (pos: TirePosition, value: string) => void
}

export function TireGrid({ values, onChange }: TireGridProps) {
  const positions: TirePosition[] = ["LF", "RF", "LR", "RR"]

  const getTireStatusColor = (value: string) => {
    const depth = Number.parseInt(value)
    if (isNaN(depth)) return "bg-slate-200"
    if (depth >= 6) return "bg-green-500"
    if (depth >= 3) return "bg-yellow-400"
    return "bg-red-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 rounded-2xl shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        {positions.map((pos) => (
          <div key={pos} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">{pos}</Label>
              <div className={`w-2 h-2 rounded-full ${getTireStatusColor(values[pos])}`} />
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="8"
                className="h-12 text-lg font-bold text-center pr-10"
                value={values[pos]}
                onChange={(e) => onChange(pos, e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                32nd
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:flex justify-center">
        <div className="relative w-48 h-64 bg-slate-50 rounded-3xl flex items-center justify-center border-4 border-dashed border-slate-200">
          <Car className="h-24 w-24 text-slate-200" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 tracking-[0.2em]">
            FRONT
          </div>
          {/* Visual indicators for tires */}
          <div className={`absolute top-8 left-4 w-4 h-8 rounded-sm ${getTireStatusColor(values.LF)}`} />
          <div className={`absolute top-8 right-4 w-4 h-8 rounded-sm ${getTireStatusColor(values.RF)}`} />
          <div className={`absolute bottom-8 left-4 w-4 h-8 rounded-sm ${getTireStatusColor(values.LR)}`} />
          <div className={`absolute bottom-8 right-4 w-4 h-8 rounded-sm ${getTireStatusColor(values.RR)}`} />
        </div>
      </div>
    </div>
  )
}
