/**
 * The Seller Memorandum of Agreement, as it read on the original Kasafide seller page
 * (public/assets/js/seller/seller-moa.js in the HomeSure repo). Shown on Seller → MOA and on
 * the Buyer → Become a Seller page, which signs it as part of the upgrade.
 */

export const MOA_SECTIONS: Array<{ title: string; body?: string[]; items?: string[] }> = [
  {
    title: 'RECITALS',
    body: [
      'This Memorandum of Agreement ("MOA") is entered into by and between Kasafide Online Property Marketplace ("Kasafide" or "the Platform") and the undersigned registered seller ("the Seller") on the date of electronic acceptance below.',
      'Kasafide is an online real estate marketplace that connects property sellers and landlords with prospective buyers and tenants within the Municipality of Sta. Maria, Bulacan. The Seller wishes to list one or more properties on Kasafide and agrees to the following terms and conditions.',
    ],
  },
  {
    title: 'ARTICLE I — PURPOSE',
    body: [
      'The purpose of this MOA is to establish the rights, obligations, and responsibilities of Kasafide and the Seller with respect to the posting, management, and promotion of property listings on the Kasafide platform. This agreement promotes transparency, accountability, and a safe marketplace for all parties.',
    ],
  },
  {
    title: 'ARTICLE II — OBLIGATIONS OF THE SELLER',
    items: [
      'The Seller shall provide accurate, truthful, and complete information for all property listings, including but not limited to the property address, type, price, photos, and availability.',
      'The Seller shall not post duplicate listings, fictitious properties, or listings that the Seller does not have the authority to sell or rent.',
      'The Seller shall ensure that all property photos submitted are genuine and accurately represent the property being listed.',
      'The Seller shall respond to buyer or tenant inquiries in a timely and professional manner.',
      'The Seller shall immediately notify Kasafide of any changes in property status (e.g., property has been sold or rented).',
      'The Seller shall comply with all applicable local government ordinances, national laws, and regulations governing real estate transactions in the Philippines.',
      "The Seller shall undergo and pass Kasafide's identity verification process before publishing active listings.",
      'The Seller shall not engage in any fraudulent, misleading, or deceptive practices on the platform.',
    ],
  },
  {
    title: 'ARTICLE III — OBLIGATIONS OF KASAFIDE',
    items: [
      "Kasafide shall maintain the Seller's listings on the platform in accordance with these terms for the duration of the Seller's active account.",
      'Kasafide shall provide the Seller with access to listing management tools, inquiry notifications, and analytics within the platform.',
      'Kasafide shall handle all personal data provided by the Seller in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173).',
      'Kasafide shall process verification documents securely and use them solely for identity verification purposes.',
      'Kasafide reserves the right to remove or suspend any listing found to be in violation of platform policies or applicable laws.',
      'Kasafide shall notify the Seller prior to any material changes in platform policies that affect their listed properties.',
    ],
  },
  {
    title: 'ARTICLE IV — INTELLECTUAL PROPERTY',
    body: [
      'By submitting photos, descriptions, and other content to Kasafide, the Seller grants Kasafide a non-exclusive, royalty-free license to display, reproduce, and promote such content for the purpose of operating and marketing the platform. The Seller represents and warrants that they hold the necessary rights to all submitted content.',
    ],
  },
  {
    title: 'ARTICLE V — CONFIDENTIALITY',
    body: [
      'Both parties agree to keep confidential any proprietary or sensitive information exchanged under this MOA and not to disclose such information to third parties without prior written consent, except as required by law.',
    ],
  },
  {
    title: 'ARTICLE VI — TERM AND TERMINATION',
    body: [
      "This MOA shall be effective upon the Seller's electronic acceptance and shall remain in force for the duration of the Seller's active registration on the Kasafide platform.",
      "Either party may terminate this agreement upon thirty (30) days' written or electronic notice. Kasafide reserves the right to immediately terminate this MOA and suspend the Seller's account in cases of fraud, gross negligence, or serious violation of platform policies.",
    ],
  },
  {
    title: 'ARTICLE VII — DISPUTE RESOLUTION',
    body: [
      'In the event of any dispute arising from this MOA, the parties shall first attempt to resolve the matter through good-faith negotiation. If the dispute cannot be resolved within thirty (30) days, the matter shall be referred to the appropriate government authority or courts of the Philippines having jurisdiction.',
    ],
  },
  {
    title: 'ARTICLE VIII — GOVERNING LAW',
    body: [
      'This MOA shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal action arising from this agreement shall be brought before the proper courts of Bulacan, Philippines.',
    ],
  },
]

export function formatMoaDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function MoaDocument({
  signedAt,
  signerName,
  scrollable = true,
}: {
  signedAt?: string | null
  signerName?: string
  scrollable?: boolean
}) {
  return (
    <div data-tour="moa-doc" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div>
          <div className="font-black tracking-wide text-[var(--text)]">MEMORANDUM OF AGREEMENT</div>
          <div className="text-xs text-[var(--text-muted)]">
            Kasafide Online Property Marketplace &amp; Property Seller
          </div>
        </div>
      </div>

      <div className={`px-6 py-5 space-y-5 ${scrollable ? 'max-h-[420px] overflow-y-auto' : ''}`}>
        {MOA_SECTIONS.map((s) => (
          <section key={s.title}>
            <h3 className="text-xs font-black tracking-wider text-[var(--primary)] mb-2">{s.title}</h3>
            {s.body?.map((p, i) => (
              <p key={i} className="text-sm text-[var(--text-soft)] leading-relaxed mb-2">
                {p}
              </p>
            ))}
            {s.items && (
              <ol className="list-decimal pl-5 space-y-1.5 text-sm text-[var(--text-soft)] leading-relaxed">
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>

      {signedAt && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 py-6 border-t border-[var(--border)]">
          {[
            { name: 'Kasafide Platform', label: 'Authorized Representative' },
            { name: signerName || '—', label: 'Seller / Property Owner' },
          ].map((sig) => (
            <div key={sig.label} className="text-center">
              <div className="font-extrabold text-sm text-[var(--text)] italic">{sig.name}</div>
              <div className="h-px bg-[var(--text-muted)]/50 my-2" />
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {sig.label}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Date: {formatMoaDate(signedAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
