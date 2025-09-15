"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "email" | "verification" | "success" | "error"

export default function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call to send reset email
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure for demo
          if (Math.random() > 0.2) {
            resolve(true)
          } else {
            reject(new Error("Email not found in our system"))
          }
        }, 2000)
      })

      setCurrentStep("verification")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
      setCurrentStep("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate resending email
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setCurrentStep("success")
    } catch (err) {
      setError("Failed to resend email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep("email")
    setEmail("")
    setError("")
    setIsLoading(false)
    onOpenChange(false)
  }

  const renderEmailStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Reset Your Password</DialogTitle>
        <DialogDescription>
          Enter your email address and we'll send you a link to reset your password.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSendResetEmail} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email address"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !email} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>
    </>
  )

  const renderVerificationStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Check Your Email</DialogTitle>
        <DialogDescription>
          We've sent a password reset link to <strong>{email}</strong>
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Email Sent Successfully</h4>
              <p className="text-sm text-blue-700">
                Click the link in the email to reset your password. The link will expire in 15 minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>Didn't receive the email? Check your spam folder or:</p>
          <Button
            variant="link"
            onClick={handleResendEmail}
            disabled={isLoading}
            className="p-0 h-auto text-indigo-600 hover:text-indigo-500"
          >
            {isLoading ? "Resending..." : "Resend email"}
          </Button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
            Close
          </Button>
          <Button onClick={() => window.open("mailto:", "_blank")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            Open Email App
          </Button>
        </div>
      </div>
    </>
  )

  const renderSuccessStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          Email Resent Successfully
        </DialogTitle>
        <DialogDescription>
          We've sent another password reset link to <strong>{email}</strong>
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Please check your email and click the reset link to continue.</AlertDescription>
        </Alert>

        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
            Close
          </Button>
          <Button onClick={() => window.open("mailto:", "_blank")} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            Open Email App
          </Button>
        </div>
      </div>
    </>
  )

  const renderErrorStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          Reset Failed
        </DialogTitle>
        <DialogDescription>We encountered an issue sending the reset email.</DialogDescription>
      </DialogHeader>

      <div className="mt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={() => setCurrentStep("email")} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
            Close
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "verification" && renderVerificationStep()}
        {currentStep === "success" && renderSuccessStep()}
        {currentStep === "error" && renderErrorStep()}
      </DialogContent>
    </Dialog>
  )
}
