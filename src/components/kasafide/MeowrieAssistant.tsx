'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { contactSupportAction } from '@/app/actions/portal'

const QUICK_PROMPTS = [
  {
    q: 'How do I get Verified as a Seller?',
    a: 'Open Seller Portal → Verification, choose your valid government ID (PhilSys, Driver’s License, Passport, or UMID), capture your live selfie, and sign the Seller MOA. An Admin reviews your submission before any listing goes live!',
  },
  {
    q: 'How do QR Ph, GCash, and Maya payments work?',
    a: 'When you and the seller agree on a deal, the seller sends a payment request card in your chat. Tap Pay now, pick E-Wallet or Bank Transfer (whichever the seller accepts), send the exact amount to the account shown, and enter your reference number. The seller confirms it once it reaches them, and it’s saved in Payments → Purchase History.',
  },
  {
    q: 'Which barangays are covered?',
    a: 'All 24 official barangays of Sta. Maria, Bulacan — including Poblacion, Cay Pombo, Pulong Buhangin, Guyong, Bagbaguin, Santa Clara, San Jose Patag, Parada, Catmon, and more!',
  },
  {
    q: 'Can I sign in with Google?',
    a: 'Yes! Both Sign In and Sign Up pages include Google OAuth alongside standard email & password accounts.',
  },
]

// Keyword rules, not an AI model (same approach as the original chatbot-widget.js).
// Each rule is a list of words; whole-word matching, so "id" does not fire on "paid" or "inside".
const RULES: Array<{ words: string[]; answer: string }> = [
  {
    words: ['agent', 'agents', 'human', 'person', 'tao', 'staff', 'support', 'representative'],
    answer: 'Sure! Tap “Talk to a live agent” below and a Kasafide admin will reply in your Messages.',
  },
  {
    words: ['upgrade', 'become', 'switch', 'convert', 'maging', 'lipat'],
    answer:
      'Already a buyer and want to sell or rent out a property? Open your profile menu → Become a Seller, read and sign the Memorandum of Agreement, and your account switches to Seller. Your messages, payments and verification stay.',
  },
  {
    words: ['history', 'receipt', 'receipts', 'purchase', 'purchases', 'transactions', 'kasaysayan', 'resibo'],
    answer:
      'Your purchase history is inside Payments: the Purchase History tab lists every confirmed, rejected and refunded payment with its reference number and receipt. Requests you still need to pay are under To Pay.',
  },
  {
    words: ['bill', 'billing', 'singil', 'maningil', 'bank', 'payout', 'collect'],
    answer:
      'Sellers: set up Payments → Payout Settings first (any e-wallet and/or a bank account). Then in Messages, open the buyer’s chat, tap + Request Payment, choose what it’s for (rent, reservation, deposit, purchase) and the amount. The buyer gets a card with a Pay now button; you confirm the payment in Payments once it arrives.',
  },
  {
    words: ['guide', 'tutorial', 'tour', 'walkthrough', 'gabay'],
    answer:
      'You can replay the Kasafide Guide anytime from your profile menu (top right) → Kasafide Guide. It walks you through verification, listings, messages and payments.',
  },
  {
    words: ['list', 'post', 'ilista', 'magbenta', 'benta', 'ipaupa', 'paupahan'],
    answer:
      'To list a property: 1) finish identity verification, 2) open Post a Property from your seller dashboard, 3) fill in the details and upload photos, 4) add the ownership document (TCT / Deed of Sale / Tax Declaration), 5) wait for an admin to approve it before it goes public.',
  },
  {
    words: ['pay', 'paid', 'payment', 'payments', 'gcash', 'maya', 'qr', 'bayad', 'magbayad', 'bayaran', 'deposit', 'downpayment'],
    answer: QUICK_PROMPTS[1].a,
  },
  {
    words: ['verify', 'verified', 'verification', 'id', 'selfie', 'moa', 'beripika', 'patunay'],
    answer: QUICK_PROMPTS[0].a,
  },
  {
    words: ['message', 'messages', 'chat', 'contact', 'seller', 'owner', 'viewing', 'kausapin', 'mensahe', 'may-ari'],
    answer:
      'Open a listing and tap Message Seller to chat with the owner inside Kasafide. You can ask about the place and send a viewing request — no phone numbers needed.',
  },
  {
    words: ['unit', 'units', 'multi', 'apartment', 'apartments'],
    answer:
      'For buildings with several units, turn on Multiple Units when posting and set the total and available units. You can adjust availability anytime from My Listings.',
  },
  {
    words: ['close', 'closed', 'sold', 'rented', 'isara', 'nabenta'],
    answer:
      'Once a deal is done you can close the listing from My Listings so it leaves public browse. For multi-unit properties, lower the available units instead.',
  },
  { words: ['barangay', 'barangays', 'map', 'location', 'saan', 'lugar'], answer: QUICK_PROMPTS[2].a },
  { words: ['google', 'signin', 'login', 'sign', 'mag-login'], answer: QUICK_PROMPTS[3].a },
  {
    words: ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta', 'meow'],
    answer:
      'Meow! I can help with listing a property, payments, verification, messaging sellers, and which barangays are covered. What would you like to know?',
  },
]

const FALLBACK =
  'Hmm, I’m not sure about that one yet. You can talk to a live agent (a Kasafide admin) below, or try asking about listing a property, payments, verification, or messaging a seller.'

function answerFor(question: string): { text: string; offerAgent: boolean } {
  const words: string[] = question.toLowerCase().match(/[a-z0-9ñ-]+/g) ?? []
  for (const rule of RULES) {
    if (rule.words.some((w) => words.includes(w))) {
      // The first rule is "I want a person", which offers the live agent too.
      return { text: rule.answer, offerAgent: rule === RULES[0] }
    }
  }
  return { text: FALLBACK, offerAgent: true }
}

type ChatLine = { from: 'bot' | 'me'; text: string; link?: { href: string; label: string } }

export function MeowrieAssistant() {
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      from: 'bot',
      text: 'Meow! Hi, I’m Meowrie — Kasafide’s verification & housing assistant for Sta. Maria, Bulacan. Tap a topic below or ask me anything!',
    },
  ])
  const [input, setInput] = useState('')
  // Live agent: the box opens with the last question Meowrie couldn't answer, ready to send.
  const [agentOpen, setAgentOpen] = useState(false)
  const [agentDraft, setAgentDraft] = useState('')
  const [agentPending, startAgent] = useTransition()
  const [lastUnanswered, setLastUnanswered] = useState('')

  function ask(question: string, cannedAnswer?: string) {
    const q = question.trim()
    if (!q) return
    const reply = cannedAnswer ? { text: cannedAnswer, offerAgent: false } : answerFor(q)
    setLastUnanswered(reply.offerAgent ? q : '')

    setMessages((prev) => [...prev, { from: 'me', text: q }, { from: 'bot', text: reply.text }])
    setInput('')
  }

  function openAgent() {
    setAgentDraft(lastUnanswered)
    setAgentOpen(true)
  }

  function sendToAgent() {
    const body = agentDraft.trim()
    if (!body) return
    startAgent(async () => {
      const res = await contactSupportAction({ body }).catch(() => ({
        ok: false as const,
        error: 'Could not reach the server. Please try again.',
        slug: undefined,
      }))
      if (res.ok) {
        setAgentOpen(false)
        setAgentDraft('')
        setLastUnanswered('')
        setMessages((prev) => [
          ...prev,
          { from: 'me', text: body },
          {
            from: 'bot',
            text: 'Done! I passed your question to a Kasafide admin. Their reply will show up in your Messages, and you’ll get a notification.',
            link: res.slug ? { href: res.slug, label: 'Open my support chat →' } : undefined,
          },
        ])
      } else {
        const needsSignIn = /sign in/i.test(res.error || '')
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: needsSignIn
              ? 'To talk to a live agent, please sign in first so the admin can reply to your account.'
              : res.error || 'Something went wrong. Please try again.',
            link: needsSignIn ? { href: '/auth/signin', label: 'Sign in →' } : undefined,
          },
        ])
      }
    })
  }

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-xl flex flex-col h-[540px]">
      <div className="px-5 py-4 bg-[#5B3A8E] text-[#FBF6F0] flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full bg-white/15 overflow-hidden flex items-center justify-center shrink-0">
          <Image
            src="/assets/img/kasafide-chatbot-avatar.svg"
            alt="Meowrie Assistant"
            width={34}
            height={34}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm">Meowrie &middot; Kasafide Support</div>
          <div className="text-[11px] text-[#DDD0EA]">Online &middot; Instant Sta. Maria Housing Help</div>
        </div>
        <button
          type="button"
          onClick={openAgent}
          data-tour="live-agent"
          className="px-3 py-1.5 rounded-full bg-[#FF8A65] text-[#2B1B3D] text-[11px] font-black whitespace-nowrap cursor-pointer hover:brightness-105"
        >
          Live agent
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.from === 'me'
                ? 'ml-auto bg-[var(--primary)] text-[var(--on-primary)] font-semibold'
                : 'bg-[var(--surface-soft)] text-[var(--text)]'
            }`}
          >
            {m.text}
            {m.link && (
              <Link href={m.link.href} className="block mt-1.5 font-extrabold text-[var(--primary)] underline">
                {m.link.label}
              </Link>
            )}
          </div>
        ))}
        {lastUnanswered && !agentOpen && (
          <button
            type="button"
            onClick={openAgent}
            className="px-4 py-2 rounded-full border-2 border-[#FF8A65] text-[var(--text)] text-xs font-extrabold cursor-pointer hover:bg-[#FF8A65] hover:text-[#2B1B3D] transition"
          >
            Talk to a live agent
          </button>
        )}
      </div>

      {agentOpen && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-soft)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[var(--text)]">Message a Kasafide admin</span>
            <button
              type="button"
              onClick={() => setAgentOpen(false)}
              className="text-xs font-bold text-[var(--text-muted)] cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={agentDraft}
            onChange={(e) => setAgentDraft(e.target.value)}
            rows={3}
            placeholder="Describe what you need help with…"
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm resize-none"
          />
          <button
            type="button"
            disabled={agentPending || !agentDraft.trim()}
            onClick={sendToAgent}
            className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-extrabold cursor-pointer disabled:opacity-50"
          >
            {agentPending ? 'Sending…' : 'Send to live agent'}
          </button>
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-[var(--border)] flex gap-2 overflow-x-auto">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.q}
            type="button"
            onClick={() => ask(p.q, p.a)}
            className="px-3 py-1.5 rounded-full bg-[var(--surface-soft)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-xs font-bold whitespace-nowrap transition cursor-pointer"
          >
            {p.q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="p-3 border-t border-[var(--border)] flex gap-2 bg-[var(--bg)]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Meowrie about listings, verification, or payments…"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  )
}
