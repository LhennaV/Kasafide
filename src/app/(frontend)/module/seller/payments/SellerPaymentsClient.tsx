'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Wallet } from 'lucide-react'
import { decidePaymentAction } from '@/app/actions/kasafide'
import { savePayoutAccountsAction } from '@/app/actions/portal'
import { PaymentsTable, Tabs, type PaymentRowView } from '../../buyer/payments/BuyerPaymentsClient'
import { withToast } from '@/lib/toast'
import { BANKS, EWALLET_PROVIDERS, ewalletLogo } from '@/lib/payout-options'

type Accounts = {
  ewalletProvider: string
  ewalletNumber: string
  ewalletName: string
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
}

export function SellerPaymentsClient({
  rows,
  accounts,
  canEditAccounts,
}: {
  rows: PaymentRowView[]
  accounts: Accounts
  canEditAccounts: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const toConfirm = rows.filter((r) => r.status === 'pending_verification' || r.status === 'refund_requested')
  const history = rows.filter((r) => !toConfirm.includes(r))
  const [tab, setTab] = useState<'confirm' | 'history'>(toConfirm.length > 0 ? 'confirm' : 'history')

  function decide(id: string, decision: 'confirmed' | 'rejected' | 'refunded') {
    startTransition(async () => {
      await withToast(decidePaymentAction({ paymentId: id, decision }))
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {canEditAccounts && <PayoutAccountsCard initial={accounts} />}

      <div>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'confirm', label: 'To Confirm', count: toConfirm.length },
            { id: 'history', label: 'Payment History', count: history.length },
          ]}
        />
        <PaymentsTable
          rows={tab === 'confirm' ? toConfirm : history}
          counterpartyLabel="Buyer / Tenant"
          empty={
            tab === 'confirm'
              ? 'Nothing to confirm. When a buyer pays your request in Messages, it lands here.'
              : 'No finished payments yet.'
          }
          action={(r) => (
            <div className="flex items-center gap-2">
              {r.status === 'pending_verification' && (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => decide(r.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-xl bg-[var(--success)]/20 text-[var(--success)] text-xs font-extrabold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => decide(r.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)] text-xs font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              )}
              {r.status === 'refund_requested' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => decide(r.id, 'refunded')}
                  className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-xs font-extrabold cursor-pointer"
                >
                  Mark Refunded
                </button>
              )}
              {r.status === 'confirmed' && <span className="text-xs text-[var(--success)] font-bold">✓ Verified</span>}
            </div>
          )}
        />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: 'numeric' | 'text'
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm"
      />
    </label>
  )
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer ${
        active
          ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]'
          : 'border-[var(--border)] text-[var(--text-soft)] hover:border-[var(--primary)]'
      }`}
    >
      {children}
    </button>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
        on ? 'bg-[var(--primary)]' : 'bg-[var(--surface-soft)] border border-[var(--border)]'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-1'}`}
      />
    </button>
  )
}

const OTHER = '__other'

function PayoutAccountsCard({ initial }: { initial: Accounts }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const hasAny = Boolean(initial.ewalletNumber || initial.bankAccountNumber)
  const [open, setOpen] = useState(!hasAny)

  const knownWallet = (EWALLET_PROVIDERS as readonly string[]).includes(initial.ewalletProvider)
  const knownBank = (BANKS as readonly string[]).includes(initial.bankName)
  const [walletOn, setWalletOn] = useState(Boolean(initial.ewalletNumber) || !hasAny)
  const [bankOn, setBankOn] = useState(Boolean(initial.bankAccountNumber))
  const [provider, setProvider] = useState(
    initial.ewalletProvider ? (knownWallet ? initial.ewalletProvider : OTHER) : 'GCash',
  )
  const [otherProvider, setOtherProvider] = useState(knownWallet ? '' : initial.ewalletProvider)
  const [walletNumber, setWalletNumber] = useState(initial.ewalletNumber)
  const [walletName, setWalletName] = useState(initial.ewalletName)
  const [bank, setBank] = useState(initial.bankName ? (knownBank ? initial.bankName : OTHER) : '')
  const [otherBank, setOtherBank] = useState(knownBank ? '' : initial.bankName)
  const [bankNumber, setBankNumber] = useState(initial.bankAccountNumber)
  const [bankHolder, setBankHolder] = useState(initial.bankAccountName)

  const providerName = provider === OTHER ? otherProvider.trim() : provider
  const bankName = bank === OTHER ? otherBank.trim() : bank
  const isMobileWallet = (EWALLET_PROVIDERS as readonly string[]).includes(provider)

  const summary = [
    initial.ewalletNumber && `${initial.ewalletProvider} ${initial.ewalletNumber}`,
    initial.bankAccountNumber && `${initial.bankName} ${initial.bankAccountNumber}`,
  ].filter(Boolean)

  function save() {
    startTransition(async () => {
      const res = await withToast(
        savePayoutAccountsAction({
          ewalletProvider: walletOn ? providerName : '',
          ewalletNumber: walletOn ? walletNumber : '',
          ewalletName: walletOn ? walletName : '',
          bankName: bankOn ? bankName : '',
          bankAccountNumber: bankOn ? bankNumber : '',
          bankAccountName: bankOn ? bankHolder : '',
        }),
      )
      if (res.ok) {
        setOpen(false)
        router.refresh()
      }
    })
  }

  const section = 'rounded-2xl border border-[var(--border)] p-4 space-y-4'

  return (
    <div data-tour="payout-settings" className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[var(--text)]">Payout Settings</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Where buyers send money. Shown to a buyer only when they tap <strong>Pay now</strong> on a payment
            request you sent in Messages.
          </p>
          {!open && (
            <p className="text-sm font-bold text-[var(--text)] mt-2">
              {summary.length > 0 ? summary.join(' · ') : 'No payment account yet'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-extrabold cursor-pointer hover:border-[var(--primary)]"
        >
          {open ? 'Close' : 'Edit payout settings'}
        </button>
      </div>

      {open && (
        <form
          className="mt-5 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* E-Wallet */}
            <div className={`${section} ${walletOn ? '' : 'opacity-70'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-sm font-extrabold">E-Wallet</div>
                    <div className="text-[11px] text-[var(--text-muted)]">GCash, Maya, ShopeePay and others</div>
                  </div>
                </div>
                <Toggle on={walletOn} onChange={setWalletOn} label="Accept e-wallet payments" />
              </div>

              {walletOn && (
                <>
                  <div>
                    <span className="block text-[11px] font-bold text-[var(--text-muted)] mb-1.5">Which e-wallet?</span>
                    <div className="flex flex-wrap gap-1.5">
                      {EWALLET_PROVIDERS.map((p) => {
                        const logo = ewalletLogo(p)
                        return (
                          <Choice key={p} active={provider === p} onClick={() => setProvider(p)}>
                            {logo && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                            )}
                            {p}
                          </Choice>
                        )
                      })}
                      <Choice active={provider === OTHER} onClick={() => setProvider(OTHER)}>
                        Other
                      </Choice>
                    </div>
                  </div>
                  {provider === OTHER && (
                    <Field label="E-wallet name" value={otherProvider} onChange={setOtherProvider} placeholder="e.g. PayPal" />
                  )}
                  <Field
                    label={isMobileWallet ? `${providerName} number` : 'Number or account ID'}
                    value={walletNumber}
                    onChange={setWalletNumber}
                    placeholder={isMobileWallet ? '0917 123 4567' : 'Account number or ID'}
                    inputMode={isMobileWallet ? 'numeric' : 'text'}
                  />
                  <Field
                    label="Account name"
                    value={walletName}
                    onChange={setWalletName}
                    placeholder={`Full name on ${providerName || 'the e-wallet'}`}
                  />
                </>
              )}
            </div>

            {/* Bank transfer */}
            <div className={`${section} ${bankOn ? '' : 'opacity-70'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-sm font-extrabold">Bank Transfer</div>
                    <div className="text-[11px] text-[var(--text-muted)]">InstaPay or PESONet to your bank</div>
                  </div>
                </div>
                <Toggle on={bankOn} onChange={setBankOn} label="Accept bank transfers" />
              </div>

              {bankOn && (
                <>
                  <label className="block">
                    <span className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">Bank</span>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm cursor-pointer"
                    >
                      <option value="" disabled>
                        Choose your bank
                      </option>
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value={OTHER}>Other bank…</option>
                    </select>
                  </label>
                  {bank === OTHER && (
                    <Field label="Bank name" value={otherBank} onChange={setOtherBank} placeholder="e.g. Bank of Commerce" />
                  )}
                  <Field
                    label="Account number"
                    value={bankNumber}
                    onChange={setBankNumber}
                    placeholder="Account number"
                    inputMode="numeric"
                  />
                  <Field label="Account name" value={bankHolder} onChange={setBankHolder} placeholder="Full name on the account" />
                </>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            Turn on at least one. Buyers can only pay with the ones that are on.
          </p>
          <button
            type="submit"
            disabled={isPending || (!walletOn && !bankOn)}
            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-sm cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save payout settings'}
          </button>
        </form>
      )}
    </div>
  )
}
