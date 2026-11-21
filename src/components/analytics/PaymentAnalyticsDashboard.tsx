'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react'

export interface PaymentItem {
  id: string
  referenceCode: string
  amount: number
  method: string
  paymentType: string
  status: 'confirmed' | 'pending_verification' | 'rejected' | 'refunded'
  createdAt: string
  payerName?: string
  payeeName?: string
  listingTitle?: string
}

export interface PaymentAnalyticsProps {
  role: 'buyer' | 'seller' | 'admin'
  payments: PaymentItem[]
}

export function PaymentAnalyticsDashboard({ role, payments }: PaymentAnalyticsProps) {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all')

  const confirmedPayments = payments.filter((p) => p.status === 'confirmed')
  const pendingPayments = payments.filter((p) => p.status === 'pending_verification')

  const totalVolume = confirmedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const pendingVolume = pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  // Payment method breakdown
  const methodCounts = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1
    return acc
  }, {})

  const filteredList = payments.filter((p) => {
    if (filter === 'confirmed') return p.status === 'confirmed'
    if (filter === 'pending') return p.status === 'pending_verification'
    return true
  })

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {role === 'seller' ? 'Total Earnings' : role === 'buyer' ? 'Total Spent' : 'Platform Volume'}
            </span>
            <Wallet className="w-5 h-5 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-[var(--primary)]">
              {formatPHP(totalVolume)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> {confirmedPayments.length} successful transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {role === 'seller' ? 'Pending Payouts' : role === 'buyer' ? 'In Escrow' : 'Pending Verification'}
            </span>
            <Clock className="w-5 h-5 text-[var(--warning)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-[var(--warning)]">
              {formatPHP(pendingVolume)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--warning)]" /> {pendingPayments.length} payments processing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {role === 'admin' ? 'Admin Escrow Fee (2%)' : 'Payment Success Rate'}
            </span>
            <TrendingUp className="w-5 h-5 text-[var(--success)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-[var(--success)]">
              {role === 'admin'
                ? formatPHP(totalVolume * 0.02)
                : `${payments.length > 0 ? Math.round((confirmedPayments.length / payments.length) * 100) : 100}%`}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Verified via Xendit QR Ph & GCash
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Methods & Channels Breakdown */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Channels:</span>
          <Badge variant="outline">QR Ph ({methodCounts['qrph'] || 0})</Badge>
          <Badge variant="outline">GCash ({methodCounts['gcash'] || 0})</Badge>
          <Badge variant="outline">Maya ({methodCounts['maya'] || 0})</Badge>
          <Badge variant="outline">Bank ({methodCounts['bank_transfer'] || 0})</Badge>
        </div>

        <div className="flex items-center gap-1 bg-[var(--surface-soft)] p-1 rounded-lg">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'ghost'}
            className="text-xs h-7 px-3"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'confirmed' ? 'default' : 'ghost'}
            className="text-xs h-7 px-3"
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </Button>
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'ghost'}
            className="text-xs h-7 px-3"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
        </div>
      </div>

      {/* Payment Table */}
      <Card className="bg-[var(--surface)] border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-soft)] text-xs font-bold uppercase text-[var(--text-muted)]">
              <tr>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">{role === 'buyer' ? 'Payee / Listing' : 'Payer / Listing'}</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    No transactions found for this filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-xs text-[var(--text)]">
                      {item.referenceCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[var(--text)]">
                        {role === 'buyer' ? item.payeeName || 'Seller' : item.payerName || 'Renter'}
                      </p>
                      {item.listingTitle && (
                        <p className="text-xs text-[var(--text-muted)] truncate max-w-xs">
                          {item.listingTitle}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {item.method}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text)]">
                      {formatPHP(item.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'confirmed' ? (
                        <Badge variant="success" className="text-xs">
                          Paid
                        </Badge>
                      ) : item.status === 'pending_verification' ? (
                        <Badge variant="warning" className="text-xs">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          {item.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
