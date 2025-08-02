import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Shield, MessageCircle, Settings } from "lucide-react";

export default function SettingsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            About Harmoni AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Therapeutic Support</h3>
              <p className="text-sm text-gray-600 mt-1">
                Harmoni provides emotional support and therapeutic conversation, but is not a replacement for professional mental health care.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Privacy & Safety</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your conversations are stored locally on your device. If you're in crisis, please contact emergency services or a crisis helpline.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">How to Use</h3>
              <p className="text-sm text-gray-600 mt-1">
                Share your thoughts and feelings openly. Harmoni will listen without judgment and offer supportive responses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-teal-500 to-blue-500">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}