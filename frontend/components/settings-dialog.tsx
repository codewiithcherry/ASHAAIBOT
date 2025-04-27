"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    mentorshipMode: true,
    saveHistory: true,
    darkMode: true,
  })
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const content = (
    <div className="py-2">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="general" className="tracking-normal">
            General
          </TabsTrigger>
          <TabsTrigger value="advanced" className="tracking-normal">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
            <div>
              <Label className="text-white font-mono tracking-normal">Mentorship Mode</Label>
              <p className="text-gray-400 text-xs tracking-normal">Focus on career advice</p>
            </div>
            <Switch
              checked={settings.mentorshipMode}
              onCheckedChange={(checked) => handleChange("mentorshipMode", checked)}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
            <div>
              <Label className="text-white font-mono tracking-normal">Save Chat History</Label>
              <p className="text-gray-400 text-xs tracking-normal">Remember conversations</p>
            </div>
            <Switch
              checked={settings.saveHistory}
              onCheckedChange={(checked) => handleChange("saveHistory", checked)}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
            <div>
              <Label className="text-white font-mono tracking-normal">Dark Mode</Label>
              <p className="text-gray-400 text-xs tracking-normal">Toggle light/dark theme</p>
            </div>
            <Switch checked={settings.darkMode} onCheckedChange={(checked) => handleChange("darkMode", checked)} />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="rounded-lg border p-4 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
            <h3 className="text-white font-mono tracking-normal mb-2">About Asha AI</h3>
            <p className="text-gray-400 text-sm tracking-normal">
              Asha is your AI career assistant, designed to help with resume building, interview preparation, and career
              development. Powered by advanced language models to provide personalized guidance.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black border-[rgba(255,255,255,0.12)] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-mono tracking-normal">Settings</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black border-t border-[rgba(255,255,255,0.12)] text-white">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl text-white font-mono tracking-normal">Settings</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 hover:bg-gray-700 text-white tracking-normal"
            >
              Apply Settings
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
