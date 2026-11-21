export function formatPeso(amount: number | null | undefined): string {
  const n = Number(amount) || 0
  return `₱${n.toLocaleString('en-PH')}`
}
