"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Frown, Meh, Smile, Angry, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmotionSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  moodValue?: string
  onMoodChange?: (value: string) => void
}

const MOODS = [
  { value: "happy", label: "Feliz", icon: Smile, color: "text-green-500" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-500" },
  { value: "sad", label: "Triste", icon: Frown, color: "text-blue-500" },
  { value: "angry", label: "Enojado", icon: Angry, color: "text-red-500" },
  { value: "excited", label: "Excitado", icon: Zap, color: "text-yellow-500" },
]

const EMOTIONS = [
  "FOMO",
  "Miedo",
  "Avaricia",
  "Confianza",
  "Duda",
  "Impaciencia",
  "Venganza",
  "Disciplina",
  "Euforia",
  "Frustración",
]

export function EmotionSelector({
  value = [],
  onChange,
  moodValue,
  onMoodChange,
}: EmotionSelectorProps) {

  const toggleEmotion = (emotion: string) => {
    if (value.includes(emotion)) {
      onChange(value.filter((e) => e !== emotion))
    } else {
      onChange([...value, emotion])
    }
  }

  return (
    <div className="space-y-4">
      {onMoodChange && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado de Ánimo</label>
          <div className="flex gap-2">
            {MOODS.map((mood) => (
              <Button
                key={mood.value}
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 transition-all",
                  moodValue === mood.value && "ring-2 ring-primary border-primary bg-accent"
                )}
                onClick={() => onMoodChange(mood.value)}
                title={mood.label}
              >
                <mood.icon className={cn("h-6 w-6", mood.color)} />
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Etiquetas Emocionales</label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => {
            const isSelected = value.includes(emotion)
            return (
              <Badge
                key={emotion}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1 text-sm transition-colors hover:bg-primary/90 hover:text-primary-foreground",
                  isSelected ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => toggleEmotion(emotion)}
              >
                {emotion}
                {isSelected && <Check className="ml-1 h-3 w-3" />}
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
}
