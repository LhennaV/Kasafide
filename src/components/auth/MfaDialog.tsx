'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Smartphone, KeyRound, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function MfaDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mfaType, setMfaType] = useState<'totp' | 'phone'>('totp')
  const [step, setStep] = useState<'select' | 'enroll' | 'verify' | 'success'>('select')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // TOTP State
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')

  // Phone SMS State
  const [phone, setPhone] = useState('')

  const supabase = createClient()

  // Start TOTP enrollment
  const handleEnrollTotp = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Kasafide',
      })

      if (error) throw error

      setFactorId(data.id)
      setQrCodeUri(data.totp.qr_code)
      setTotpSecret(data.totp.secret)
      setStep('enroll')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start MFA enrollment')
    } finally {
      setLoading(false)
    }
  }

  // Verify TOTP Code
  const handleVerifyTotp = async () => {
    if (!factorId || !verifyCode) return
    try {
      setLoading(true)
      setErrorMsg(null)
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })

      if (verify.error) throw verify.error

      setStep('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid 6-digit verification code')
    } finally {
      setLoading(false)
    }
  }

  // Handle Phone OTP Request
  const handleSendPhoneOtp = async () => {
    if (!phone) {
      setErrorMsg('Please enter a valid mobile number (+63...)')
      return
    }
    try {
      setLoading(true)
      setErrorMsg(null)
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      })
      if (error) throw error
      setStep('verify')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send SMS code')
    } finally {
      setLoading(false)
    }
  }

  // Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    if (!phone || !verifyCode) return
    try {
      setLoading(true)
      setErrorMsg(null)
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: verifyCode,
        type: 'sms',
      })
      if (error) throw error
      setStep('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid SMS code')
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setStep('select')
    setErrorMsg(null)
    setVerifyCode('')
    setFactorId(null)
    setQrCodeUri(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetState()
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--success)]" /> Setup Two-Factor Auth (2FA)
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--primary)]" /> Two-Factor Authentication
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              MFA Security
            </Badge>
          </div>
          <DialogDescription className="text-xs text-[var(--text-muted)]">
            Protect your Kasafide account with Google Authenticator or SMS verification.
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMfaType('totp')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  mfaType === 'totp'
                    ? 'border-[var(--primary)] bg-[var(--surface-soft)]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-soft)]'
                }`}
              >
                <KeyRound className="w-6 h-6 text-[var(--primary)] mb-2" />
                <p className="font-bold text-sm text-[var(--text)]">Authenticator App</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Google Authenticator, Authy, or 1Password (Recommended)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMfaType('phone')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  mfaType === 'phone'
                    ? 'border-[var(--primary)] bg-[var(--surface-soft)]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-soft)]'
                }`}
              >
                <Smartphone className="w-6 h-6 text-[var(--success)] mb-2" />
                <p className="font-bold text-sm text-[var(--text)]">SMS Phone Number</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Receive a 6-digit OTP code on your Philippine mobile (+63)
                </p>
              </button>
            </div>

            {mfaType === 'totp' ? (
              <Button
                onClick={handleEnrollTotp}
                disabled={loading}
                className="w-full font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Authenticator'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="mfa-phone">Mobile Number</Label>
                <Input
                  id="mfa-phone"
                  placeholder="+639XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button
                  onClick={handleSendPhoneOtp}
                  disabled={loading}
                  className="w-full font-bold"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TOTP QR Code & Secret */}
        {step === 'enroll' && mfaType === 'totp' && (
          <div className="space-y-4 py-2 flex flex-col items-center text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Scan this QR code with Google Authenticator, or paste the secret key:
            </p>

            {qrCodeUri && (
              <div className="p-3 bg-white rounded-2xl border-2 border-[var(--border)]">
                <img src={qrCodeUri} alt="TOTP QR Code" className="w-44 h-44" />
              </div>
            )}

            {totpSecret && (
              <div className="p-2 bg-[var(--surface-soft)] rounded-lg text-xs font-mono select-all">
                {totpSecret}
              </div>
            )}

            <div className="w-full space-y-2 text-left">
              <Label htmlFor="totp-code">Enter 6-digit code from App</Label>
              <Input
                id="totp-code"
                placeholder="123456"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
            </div>

            <Button
              onClick={handleVerifyTotp}
              disabled={loading || verifyCode.length < 6}
              className="w-full font-bold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activate 2FA'}
            </Button>
          </div>
        )}

        {/* Phone Verify Step */}
        {step === 'verify' && mfaType === 'phone' && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-[var(--text-muted)]">
              Enter the 6-digit SMS code sent to <span className="font-bold text-[var(--text)]">{phone}</span>:
            </p>
            <Input
              placeholder="123456"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
            <Button
              onClick={handleVerifyPhoneOtp}
              disabled={loading || verifyCode.length < 6}
              className="w-full font-bold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
            </Button>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[var(--success)]" />
            <p className="text-lg font-bold text-[var(--text)]">Two-Factor Authentication Active</p>
            <p className="text-xs text-[var(--text-muted)] max-w-xs">
              Your account is now secured with {mfaType === 'totp' ? 'Authenticator App' : 'SMS Phone MFA'}.
            </p>
            <Button onClick={() => setOpen(false)} variant="outline" className="mt-2">
              Done
            </Button>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-center text-[var(--danger)] bg-[var(--danger)]/10 p-2 rounded-lg">
            {errorMsg}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
