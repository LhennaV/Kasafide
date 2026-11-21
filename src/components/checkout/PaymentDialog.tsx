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
import { Badge } from '@/components/ui/badge'
import { QrCode, CreditCard, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'

export interface PaymentDialogProps {
  listingId?: string
  listingTitle?: string
  amount: number
  trigger?: React.ReactNode
}

export function PaymentDialog({
  listingId,
  listingTitle = 'Kasafide Property Reservation',
  amount,
  trigger,
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<'qrph' | 'invoice'>('qrph')
  const [loading, setLoading] = useState(false)
  const [qrString, setQrString] = useState<string | null>(null)
  const [refCode, setRefCode] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleGenerateQR = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)

      const res = await fetch('/api/xendit/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, amount }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate QR Ph')

      setQrString(data.qrString)
      setRefCode(data.referenceId)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'QR Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)

      const res = await fetch('/api/xendit/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          amount,
          description: `Reservation fee for ${listingTitle}`,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice')

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout initialization failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && method === 'qrph' && !qrString) {
      handleGenerateQR()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="w-full font-bold">
            Reserve Now
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Secure Checkout
            </DialogTitle>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" /> Verified Escrow
            </Badge>
          </div>
          <DialogDescription className="text-xs text-[var(--text-muted)]">
            Powered by Xendit Philippines • Zero processing fee for renters
          </DialogDescription>
        </DialogHeader>

        {/* Amount Summary */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)]">{listingTitle}</p>
            <p className="text-lg font-bold text-[var(--primary)]">
              ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Reservation
          </Badge>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setMethod('qrph')
              if (!qrString) handleGenerateQR()
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              method === 'qrph'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <QrCode className="w-4 h-4" /> QR Ph
          </button>
          <button
            type="button"
            onClick={() => setMethod('invoice')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              method === 'invoice'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <CreditCard className="w-4 h-4" /> GCash / Cards
          </button>
        </div>

        {/* Method Content */}
        {method === 'qrph' ? (
          <div className="flex flex-col items-center justify-center py-3 text-center space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                <p className="text-xs text-[var(--text-muted)]">Generating official QR Ph code...</p>
              </div>
            ) : qrString ? (
              <>
                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-[var(--border)]">
                  {/* Render standard QR Code */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(
                      qrString
                    )}`}
                    alt="QR Ph Payment"
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--text)]">
                    Scan using GCash, Maya, or any Philippine Banking App
                  </p>
                  {refCode && (
                    <p className="text-[11px] font-mono text-[var(--text-muted)]">
                      Ref: {refCode}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--success)]">
                  <CheckCircle2 className="w-4 h-4" /> Auto-confirms upon scanning
                </div>
              </>
            ) : (
              <Button onClick={handleGenerateQR} variant="default" size="sm">
                Generate QR Ph Code
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col py-3 space-y-4">
            <div className="text-xs text-[var(--text-muted)] space-y-2">
              <p>You will be redirected to Xendit's secure payment portal where you can pay using:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">GCash</Badge>
                <Badge variant="secondary">Maya</Badge>
                <Badge variant="secondary">Visa / Mastercard</Badge>
                <Badge variant="secondary">BDO / BPI / UnionBank</Badge>
              </div>
            </div>

            <Button
              onClick={handleCreateInvoice}
              disabled={loading}
              variant="default"
              className="w-full py-5 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...
                </>
              ) : (
                <>
                  Proceed to Secure Checkout <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
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
