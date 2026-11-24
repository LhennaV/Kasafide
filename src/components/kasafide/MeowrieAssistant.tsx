'use client'

import { useState } from 'react'
import Image from 'next/image'

const QUICK_PROMPTS = [
  {
    q: 'How do I get Verified as a Seller?',
    a: 'Open Seller Portal → Verification, choose your valid government ID (PhilSys, Driver’s License, Passport, or UMID), capture your live selfie, and sign the Seller MOA. An Admin reviews your submission before any listing goes live!',
  },
  {
    q: 'How do QR Ph, GCash, and Maya payments work?',
    a: 'Payment amounts are always computed on the server from the verified listing price so nobody can alter totals. You can pay via QR Ph or upload a GCash/Maya reference, and the landowner confirms it in Payment Management.',
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
  'Hmm, I’m not sure about that one yet. Try asking about listing a property, payments, verification, or messaging a seller — or check the FAQs page.'

function answerFor(question: string) {
  const words: string[] = question.toLowerCase().match(/[a-z0-9ñ-]+/g) ?? []
  for (const rule of RULES) {
    if (rule.words.some((w) => words.includes(w))) return rule.answer
  }
  return FALLBACK
}

export function MeowrieAssistant() {
  const [messages, setMessages] = useState<Array<{ from: 'bot' | 'me'; text: string }>>([
    {
      from: 'bot',
      text: 'Meow! Hi, I’m Meowrie — Kasafide’s verification & housing assistant for Sta. Maria, Bulacan. Tap a topic below or ask me anything!',
    },
  ])
  const [input, setInput] = useState('')

  function ask(question: string, cannedAnswer?: string) {
    const q = question.trim()
    if (!q) return
    const reply = cannedAnswer || answerFor(q)

    setMessages((prev) => [...prev, { from: 'me', text: q }, { from: 'bot', text: reply }])
    setInput('')
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
        <div>
          <div className="font-extrabold text-sm">Meowrie &middot; Kasafide Support</div>
          <div className="text-[11px] text-[#DDD0EA]">Online &middot; Instant Sta. Maria Housing Help</div>
        </div>
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
          </div>
        ))}
      </div>

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
