/**
 * Choices on the seller's Payout Settings (shared by the form, the server action and Pay now).
 * The lists are suggestions: "Other" lets a seller type a provider or bank not listed here.
 */

export const EWALLET_PROVIDERS = ['GCash', 'Maya', 'ShopeePay', 'GrabPay', 'Coins.ph'] as const

/** Providers whose account is a PH mobile number (normalised to 09XXXXXXXXX). */
export const MOBILE_EWALLETS: readonly string[] = EWALLET_PROVIDERS

export const BANKS = [
  'BDO',
  'BPI',
  'Metrobank',
  'Landbank',
  'PNB',
  'Security Bank',
  'UnionBank',
  'RCBC',
  'China Bank',
  'EastWest',
  'GoTyme',
  'Maribank',
] as const

/** Logo for the few providers we have one for; others show a generic wallet icon. */
export function ewalletLogo(provider: string | null | undefined): string | null {
  if (provider === 'GCash') return '/assets/img/gcashlogo.png'
  if (provider === 'Maya') return '/assets/img/mayalogo.png'
  return null
}
