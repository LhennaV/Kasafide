'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CreditCard, Headset, House, Landmark, Wallet } from 'lucide-react'
import { ewalletLogo } from '@/lib/payout-options'
import { sendMessageAction } from '@/app/actions/kasafide'
import {
  contactSupportAction,
  payRequestAction,
  replySupportAction,
  requestPaymentAction,
} from '@/app/actions/portal'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { uploadFile } from '@/lib/upload-client'
import { withToast } from '@/lib/toast'

export type PayToAccounts = {
  ewallet?: { provider: string; number: string; name: string }
  bank?: { bank: string; number: string; name: string }
}

type PaymentType = 'rent' | 'reservation' | 'security_deposit' | 'purchase'

export type ThreadView = {
  partnerId: string
  partnerName: string
  partnerRole: string
  listingId?: string
  listingTitle?: string
  messages: Array<{
    id: string
    fromMe: boolean
    /** Shown above messages in the support chat (which admin answered). */
    senderName?: string
    body: string
    messageType: 'text' | 'viewing_request' | 'payment_request' | 'support'
    requestedAmount?: number | null
    requestedPaymentType?: PaymentType | null
    requestedPeriodLabel?: string
    listingTitle?: string
    /** For payment requests: 'unpaid' or the status of the payment made against it. */
    paymentStatus?: string
    /** For payment requests addressed to me: where the seller receives money. */
    payTo?: PayToAccounts
    createdAt: string
  }>
}

const SUPPORT_ID = 'support'
const TYPE_LABEL: Record<PaymentType, string> = {
  rent: 'Monthly Rent',
  reservation: 'Reservation Fee',
  security_deposit: 'Security Deposit',
  purchase: 'Property Purchase',
}
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

function statusChip(status: string | undefined, fromMe: boolean) {
  switch (status) {
    case 'pending_verification':
      return { text: fromMe ? 'Paid · confirm in Payments' : 'Paid · waiting for seller', cls: 'bg-[var(--warning)]/20 text-[var(--warning)]' }
    case 'confirmed':
      return { text: 'Paid & confirmed', cls: 'bg-[var(--success)]/20 text-[var(--success)]' }
    case 'rejected':
      return { text: fromMe ? 'Payment rejected' : 'Rejected · pay again', cls: 'bg-[var(--danger)]/20 text-[var(--danger)]' }
    case 'refund_requested':
      return { text: 'Refund requested', cls: 'bg-[var(--warning)]/20 text-[var(--warning)]' }
    case 'refunded':
      return { text: 'Refunded', cls: 'bg-[var(--surface-soft)] text-[var(--text-muted)]' }
    default:
      return { text: fromMe ? 'Waiting for payment' : 'Unpaid', cls: 'bg-[var(--primary)]/15 text-[var(--primary)]' }
  }
}

export function MessengerWorkspace({
  threads,
  canRequestPayment = false,
  mode = 'member',
}: {
  threads: ThreadView[]
  canRequestPayment?: boolean
  /** 'admin-support' = the admin Live Support inbox (replies go to the member as support). */
  mode?: 'member' | 'admin-support'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Members always see the live-agent chat in their list, even before writing to it.
  const allThreads: ThreadView[] =
    mode === 'member' && !threads.some((t) => t.partnerId === SUPPORT_ID)
      ? [
          ...threads,
          {
            partnerId: SUPPORT_ID,
            partnerName: 'Kasafide Support · Live Agent',
            partnerRole: 'admin',
            messages: [],
          },
        ]
      : threads

  const [selectedId, setSelectedId] = useState<string | null>(allThreads[0]?.partnerId ?? null)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [reqAmount, setReqAmount] = useState('')
  const [reqType, setReqType] = useState<PaymentType>('rent')
  const [reqPeriod, setReqPeriod] = useState('')
  const [payingId, setPayingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Open the thread named in ?thread= (links from notifications / Meowrie).
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('thread')
    if (want && allThreads.some((t) => t.partnerId === want)) {
      setSelectedId(want)
      setMobileChatOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeThread = allThreads.find((t) => t.partnerId === selectedId) || null
  const isSupportThread = mode === 'admin-support' || activeThread?.partnerId === SUPPORT_ID

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [selectedId, activeThread?.messages.length])

  function sendText(e: React.FormEvent) {
    e.preventDefault()
    if (!activeThread || !draft.trim()) return
    const text = draft
    setDraft('')
    startTransition(async () => {
      const call =
        mode === 'admin-support'
          ? replySupportAction({ memberId: activeThread.partnerId, body: text })
          : activeThread.partnerId === SUPPORT_ID
            ? contactSupportAction({ body: text })
            : sendMessageAction({
                recipientId: activeThread.partnerId,
                listingId: activeThread.listingId,
                body: text,
                messageType: 'text',
              })
      const res = await withToast(call, { quiet: true })
      if (!res.ok) setDraft(text)
      router.refresh()
    })
  }

  function sendPaymentRequest() {
    if (!activeThread) return
    const amount = Number(reqAmount)
    if (!(amount > 0)) return
    startTransition(async () => {
      const res = await withToast(
        requestPaymentAction({
          recipientId: activeThread.partnerId,
          listingId: activeThread.listingId || '',
          amount,
          paymentType: reqType,
          periodLabel: reqPeriod,
        }),
      )
      if (res.ok) {
        setReqAmount('')
        setReqPeriod('')
        setShowRequestForm(false)
        router.refresh()
      }
    })
  }

  if (allThreads.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <h2 className="font-extrabold text-lg mb-1">
          {mode === 'admin-support' ? 'No support chats yet' : 'No conversations yet'}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {mode === 'admin-support'
            ? 'When a member taps “Talk to a live agent” in Meowrie, their chat shows up here.'
            : 'Open any verified property listing and tap “Message Seller” to start a secure thread.'}
        </p>
      </div>
    )
  }

  const payingMessage = activeThread?.messages.find((m) => m.id === payingId) || null

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden h-[calc(100vh-180px)] min-h-[480px] grid grid-cols-1 md:grid-cols-12 relative">
      {/* Conversation list */}
      <div
        className={`md:col-span-4 border-r border-[var(--border)] flex flex-col h-full min-h-0 ${
          mobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-black text-[var(--text)]">
            {mode === 'admin-support' ? 'Live Support' : 'Messages'}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {mode === 'admin-support'
              ? 'Questions Meowrie could not answer, from buyers and sellers'
              : 'Direct threads on Kasafide'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]/50">
          {allThreads.map((t) => {
            const last = t.messages[t.messages.length - 1]
            const isSelected = t.partnerId === selectedId
            const support = t.partnerId === SUPPORT_ID
            return (
              <button
                key={t.partnerId}
                type="button"
                data-tour={support ? 'support-thread' : undefined}
                onClick={() => {
                  setSelectedId(t.partnerId)
                  setMobileChatOpen(true)
                  setShowRequestForm(false)
                }}
                className={`w-full p-4 text-left flex items-start gap-3 transition cursor-pointer ${
                  isSelected ? 'bg-[var(--primary)]/12' : 'hover:bg-[var(--surface-soft)]'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full font-extrabold text-sm flex items-center justify-center shrink-0 ${
                    support ? 'bg-[#FF8A65] text-[#2B1B3D]' : 'bg-[#5B3A8E] text-[#FBF6F0]'
                  }`}
                >
                  {support ? <Headset className="w-5 h-5" /> : t.partnerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm text-[var(--text)] truncate">{t.partnerName}</div>
                  {t.listingTitle && (
                    <div className="text-[11px] font-bold text-[var(--primary)] truncate">{t.listingTitle}</div>
                  )}
                  <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {last
                      ? last.messageType === 'payment_request'
                        ? `Payment request · ${peso(Number(last.requestedAmount) || 0)}`
                        : last.body
                      : support
                        ? 'Talk to a Kasafide admin'
                        : 'Start chatting'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active thread */}
      <div className={`md:col-span-8 flex flex-col h-full min-h-0 ${mobileChatOpen ? 'flex' : 'hidden md:flex'}`}>
        {activeThread && (
          <>
            <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between gap-2 bg-[var(--surface-soft)]/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(false)}
                  className="md:hidden px-2.5 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-extrabold text-[var(--primary)]"
                >
                  &larr; Back
                </button>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-[var(--text)] truncate">{activeThread.partnerName}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">
                    {isSupportThread
                      ? mode === 'admin-support'
                        ? `${activeThread.partnerRole} · replies are sent as Kasafide Support`
                        : 'A Kasafide admin will reply here'
                      : activeThread.listingTitle
                        ? `Re: ${activeThread.listingTitle}`
                        : ''}
                  </div>
                </div>
              </div>

              {canRequestPayment && !isSupportThread && (
                <button
                  type="button"
                  data-tour="request-payment"
                  onClick={() => setShowRequestForm((v) => !v)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-extrabold cursor-pointer shrink-0"
                >
                  + Request Payment
                </button>
              )}
            </div>

            {showRequestForm && !isSupportThread && (
              <div className="p-3 bg-[var(--surface-soft)] border-b border-[var(--border)] space-y-2">
                {!activeThread.listingId ? (
                  <p className="text-xs text-[var(--danger)] font-bold">
                    This chat isn&apos;t about one of your listings yet, so there&apos;s nothing to bill.
                  </p>
                ) : (
                  <>
                    <div className="text-[11px] font-bold text-[var(--text-muted)]">
                      Bill {activeThread.partnerName} for {activeThread.listingTitle}. They&apos;ll get a card with a
                      Pay now button.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={reqType}
                        onChange={(e) => setReqType(e.target.value as PaymentType)}
                        className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs font-bold"
                      >
                        {(Object.keys(TYPE_LABEL) as PaymentType[]).map((k) => (
                          <option key={k} value={k}>
                            {TYPE_LABEL[k]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        inputMode="decimal"
                        value={reqAmount}
                        onChange={(e) => setReqAmount(e.target.value)}
                        placeholder="Amount (₱)"
                        className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs"
                      />
                      <input
                        type="text"
                        value={reqPeriod}
                        onChange={(e) => setReqPeriod(e.target.value)}
                        placeholder="Period (e.g. December 2026)"
                        className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isPending || !(Number(reqAmount) > 0)}
                        onClick={sendPaymentRequest}
                        className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer disabled:opacity-50"
                      >
                        Send payment request
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeThread.messages.length === 0 && isSupportThread && (
                <div className="max-w-md mx-auto text-center text-sm text-[var(--text-muted)] py-10">
                  Ask anything Meowrie couldn&apos;t answer. A Kasafide admin will reply in this chat, and you&apos;ll
                  get a notification.
                </div>
              )}

              {activeThread.messages.map((m) =>
                m.messageType === 'payment_request' ? (
                  <PaymentCard
                    key={m.id}
                    m={m}
                    onPay={() => setPayingId(m.id)}
                  />
                ) : (
                  <div key={m.id} className={`max-w-[82%] ${m.fromMe ? 'ml-auto' : ''}`}>
                    {m.senderName && (
                      <div className={`text-[10.5px] font-bold text-[var(--text-muted)] mb-0.5 ${m.fromMe ? 'text-right' : ''}`}>
                        {m.senderName}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-3.5 text-sm whitespace-pre-wrap break-words ${
                        m.fromMe
                          ? 'bg-[var(--primary)] text-[var(--on-primary)] font-medium'
                          : 'bg-[var(--surface-soft)] text-[var(--text)]'
                      }`}
                    >
                      {m.messageType === 'viewing_request' && (
                        <div className="text-[10.5px] font-black uppercase tracking-wider mb-1 opacity-85">
                          <CalendarDays className="w-3.5 h-3.5 inline-block -mt-0.5 mr-1" />Viewing Request
                        </div>
                      )}
                      {m.body}
                    </div>
                  </div>
                ),
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendText} className="p-3 border-t border-[var(--border)] flex items-center gap-2 bg-[var(--bg)]">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isSupportThread && mode === 'member' ? 'Ask a Kasafide admin…' : 'Write a message…'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {payingMessage && (
        <PayNowDialog
          message={payingMessage}
          onClose={() => setPayingId(null)}
          onPaid={() => {
            setPayingId(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

// ── Payment request card ─────────────────────────────────────────────────────

function PaymentCard({ m, onPay }: { m: ThreadView['messages'][number]; onPay: () => void }) {
  const chip = statusChip(m.paymentStatus, m.fromMe)
  const canPay = !m.fromMe && (m.paymentStatus === 'unpaid' || m.paymentStatus === 'rejected')
  const type = (m.requestedPaymentType || 'rent') as PaymentType
  return (
    <div className={`max-w-[320px] w-full ${m.fromMe ? 'ml-auto' : ''}`}>
      <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="px-4 py-3 bg-gradient-to-br from-[#5B3A8E] to-[#7B54B3] text-[#FBF6F0]">
          <div className="text-[10.5px] font-black uppercase tracking-wider opacity-85"><CreditCard className="w-3.5 h-3.5 inline-block -mt-0.5 mr-1" />Payment Request</div>
          <div className="text-2xl font-black mt-0.5">{peso(Number(m.requestedAmount) || 0)}</div>
          <div className="text-xs opacity-90">
            {TYPE_LABEL[type]}
            {m.requestedPeriodLabel ? ` · ${m.requestedPeriodLabel}` : ''}
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {m.listingTitle && <div className="text-xs text-[var(--text-muted)] truncate"><House className="w-3.5 h-3.5 inline-block -mt-0.5 mr-1" />{m.listingTitle}</div>}
          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${chip.cls}`}>
            {chip.text}
          </span>
          {canPay && (
            <button
              type="button"
              onClick={onPay}
              className="w-full py-2.5 rounded-xl bg-[#FF8A65] text-[#2B1B3D] font-black text-sm cursor-pointer hover:brightness-105"
            >
              Pay now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pay now popup: E-Wallet or Bank ──────────────────────────────────────────

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
        <div className="font-extrabold text-sm text-[var(--text)] break-all">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="px-2.5 py-1 rounded-lg border border-[var(--border)] text-[11px] font-bold cursor-pointer shrink-0"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function PayNowDialog({
  message,
  onClose,
  onPaid,
}: {
  message: ThreadView['messages'][number]
  onClose: () => void
  onPaid: () => void
}) {
  const payTo = message.payTo || {}
  const wallet = payTo.ewallet
  const walletLogo = ewalletLogo(wallet?.provider)
  const [route, setRoute] = useState<'ewallet' | 'bank' | null>(null)
  const [reference, setReference] = useState('')
  const [proof, setProof] = useState<{ path: string; name: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const amount = Number(message.requestedAmount) || 0

  async function onProofPicked(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setError(null)
    const res = await uploadFile('payment-proof', file)
    setUploading(false)
    if (res.ok) setProof({ path: res.path, name: file.name })
    else setError(res.error)
  }

  function submit() {
    const method = route === 'bank' ? 'bank_transfer' : 'ewallet'
    setError(null)
    startTransition(async () => {
      const res = await withToast(
        payRequestAction({ messageId: message.id, method, reference, proofPath: proof?.path }),
      )
      if (res.ok) onPaid()
      else setError(res.error || 'Payment could not be recorded.')
    })
  }

  const account = route === 'bank' ? payTo.bank : route === 'ewallet' ? wallet : undefined

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[var(--surface)] border-[var(--border)] text-[var(--text)] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Pay {peso(amount)}</DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-muted)]">
            {TYPE_LABEL[(message.requestedPaymentType || 'rent') as PaymentType]}
            {message.requestedPeriodLabel ? ` · ${message.requestedPeriodLabel}` : ''}
            {message.listingTitle ? ` · ${message.listingTitle}` : ''}
          </DialogDescription>
        </DialogHeader>

        {!route ? (
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-[var(--text-muted)]">How do you want to pay?</div>
            <button
              type="button"
              disabled={!wallet}
              onClick={() => setRoute('ewallet')}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {walletLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={walletLogo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-extrabold text-sm">E-Wallet</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {wallet ? wallet.provider : 'The seller has not added an e-wallet'}
                </div>
              </div>
            </button>
            <button
              type="button"
              disabled={!payTo.bank}
              onClick={() => setRoute('bank')}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-lg shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm">Bank Transfer</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {payTo.bank ? `${payTo.bank.bank} · InstaPay / PESONet` : 'The seller has not added a bank account'}
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setRoute(null)}
              className="text-xs font-bold text-[var(--primary)] cursor-pointer"
            >
              &larr; Change payment method
            </button>

            {account && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 divide-y divide-[var(--border)]/60">
                <div className="py-1.5 text-xs text-[var(--text-muted)]">
                  1. Send exactly <strong className="text-[var(--text)]">{peso(amount)}</strong> to:
                </div>
                {route === 'bank' && payTo.bank && <CopyRow label="Bank" value={payTo.bank.bank} />}
                <CopyRow
                  label={route === 'bank' ? 'Account number' : `${wallet?.provider ?? 'E-wallet'} number`}
                  value={account.number}
                />
                <CopyRow label="Account name" value={account.name} />
                <CopyRow label="Amount" value={String(amount)} />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5">2. Reference number from your receipt</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={route === 'bank' ? 'e.g. 202612010001234' : 'e.g. 1023 456 789012'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">3. Screenshot of the receipt (optional)</label>
              <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[var(--border)] text-xs cursor-pointer hover:border-[var(--primary)]">
                <span className="truncate">
                  {uploading ? 'Uploading…' : proof ? `✓ ${proof.name}` : 'Choose an image'}
                </span>
                <span className="font-bold text-[var(--primary)]">Browse</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onProofPicked(e.target.files?.[0])}
                />
              </label>
            </div>

            {error && (
              <p className="text-xs text-[var(--danger)] bg-[var(--danger)]/10 p-2 rounded-lg">{error}</p>
            )}

            <button
              type="button"
              disabled={isPending || uploading || reference.trim().length < 4}
              onClick={submit}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-black text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Sending…' : `I've paid ${peso(amount)}`}
            </button>
            <p className="text-[11px] text-center text-[var(--text-muted)]">
              The seller confirms once the money reaches their account. You&apos;ll see it in Payments → History.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
