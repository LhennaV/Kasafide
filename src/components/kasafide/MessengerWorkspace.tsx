'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessageAction } from '@/app/actions/kasafide'

export type ThreadView = {
  partnerId: string
  partnerName: string
  partnerRole: string
  listingId?: string
  listingTitle?: string
  messages: Array<{
    id: string
    fromMe: boolean
    body: string
    messageType: 'text' | 'viewing_request' | 'payment_request'
    requestedAmount?: number | null
    createdAt: string
  }>
}

export function MessengerWorkspace({
  threads,
  canRequestPayment = false,
}: {
  threads: ThreadView[]
  canRequestPayment?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [requestAmount, setRequestAmount] = useState('')
  const [showPayPrompt, setShowPayPrompt] = useState(false)

  const activeThread = threads[selectedIdx] || null

  function sendText(e: React.FormEvent) {
    e.preventDefault()
    if (!activeThread || !draft.trim()) return
    const text = draft
    setDraft('')
    startTransition(async () => {
      await sendMessageAction({
        recipientId: activeThread.partnerId,
        listingId: activeThread.listingId,
        body: text,
        messageType: 'text',
      })
      router.refresh()
    })
  }

  function sendPaymentRequest() {
    if (!activeThread || !Number(requestAmount)) return
    const amt = Number(requestAmount)
    setRequestAmount('')
    setShowPayPrompt(false)
    startTransition(async () => {
      await sendMessageAction({
        recipientId: activeThread.partnerId,
        listingId: activeThread.listingId,
        body: `In-chat payment request of ₱${amt.toLocaleString('en-PH')} for ${activeThread.listingTitle || 'property rental'}.`,
        messageType: 'payment_request',
        requestedAmount: amt,
      })
      router.refresh()
    })
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <h2 className="font-extrabold text-lg mb-1">No conversations yet</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Open any verified property listing and tap &ldquo;Message Seller&rdquo; to start a secure thread.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden h-[calc(100vh-180px)] min-h-[480px] grid grid-cols-1 md:grid-cols-12 relative">
      {/* Left Conversation List (Slides out on mobile when chat is open) */}
      <div
        className={`md:col-span-4 border-r border-[var(--border)] flex flex-col h-full ${
          mobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-black text-[var(--text)]">Messages</h2>
          <p className="text-xs text-[var(--text-muted)]">Direct encrypted threads on Kasafide</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]/50">
          {threads.map((t, idx) => {
            const last = t.messages[t.messages.length - 1]
            const isSelected = idx === selectedIdx
            return (
              <button
                key={t.partnerId}
                type="button"
                onClick={() => {
                  setSelectedIdx(idx)
                  setMobileChatOpen(true)
                }}
                className={`w-full p-4 text-left flex items-start gap-3 transition cursor-pointer ${
                  isSelected ? 'bg-[var(--primary)]/12' : 'hover:bg-[var(--surface-soft)]'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#5B3A8E] text-[#FBF6F0] font-extrabold text-sm flex items-center justify-center shrink-0">
                  {t.partnerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm text-[var(--text)] truncate">
                    {t.partnerName}
                  </div>
                  {t.listingTitle && (
                    <div className="text-[11px] font-bold text-[var(--primary)] truncate">
                      {t.listingTitle}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {last?.body || 'Start chatting'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Active Thread (Full-screen mobile slide-in with Back button) */}
      <div
        className={`md:col-span-8 flex flex-col h-full ${
          mobileChatOpen ? 'flex' : 'hidden md:flex'
        }`}
      >
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
                  <div className="font-extrabold text-sm text-[var(--text)] truncate">
                    {activeThread.partnerName}
                  </div>
                  {activeThread.listingTitle && (
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      Re: {activeThread.listingTitle}
                    </div>
                  )}
                </div>
              </div>

              {canRequestPayment && (
                <button
                  type="button"
                  onClick={() => setShowPayPrompt((v) => !v)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-extrabold cursor-pointer shrink-0"
                >
                  + Request Payment
                </button>
              )}
            </div>

            {showPayPrompt && (
              <div className="p-3 bg-[var(--surface-soft)] border-b border-[var(--border)] flex items-center gap-2">
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="Amount in ₱ (e.g. 12500)"
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={sendPaymentRequest}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeThread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[82%] rounded-2xl p-3.5 text-sm ${
                    m.fromMe
                      ? 'ml-auto bg-[var(--primary)] text-[var(--on-primary)] font-medium'
                      : 'bg-[var(--surface-soft)] text-[var(--text)]'
                  }`}
                >
                  {m.messageType === 'viewing_request' && (
                    <div className="text-[10.5px] font-black uppercase tracking-wider mb-1 opacity-85">
                      📅 Viewing Request
                    </div>
                  )}
                  {m.messageType === 'payment_request' && (
                    <div className="text-[10.5px] font-black uppercase tracking-wider mb-1 opacity-85">
                      💳 In-Chat Payment Request{' '}
                      {m.requestedAmount ? `· ₱${m.requestedAmount.toLocaleString('en-PH')}` : ''}
                    </div>
                  )}
                  <div>{m.body}</div>
                </div>
              ))}
            </div>

            <form
              onSubmit={sendText}
              className="p-3 border-t border-[var(--border)] flex items-center gap-2 bg-[var(--bg)]"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message…"
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
    </div>
  )
}
