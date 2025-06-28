"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [empathyMode, setEmpathyMode] = useState(true)
  const [solutionFocused, setSolutionFocused] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="empathy-mode" className="text-sm font-medium">
                Empathy Mode
              </Label>
              <p className="text-sm text-gray-600">AI responses focus on emotional support and understanding</p>
            </div>
            <Switch id="empathy-mode" checked={empathyMode} onCheckedChange={setEmpathyMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="solution-focused" className="text-sm font-medium">
                Solution Focused Mode
              </Label>
              <p className="text-sm text-gray-600">AI responses emphasize practical solutions and actionable advice</p>
            </div>
            <Switch id="solution-focused" checked={solutionFocused} onCheckedChange={setSolutionFocused} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
