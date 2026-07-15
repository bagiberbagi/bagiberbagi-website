export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function calcTotal(pax: number): number {
  return pax * 25000;
}

export function buildWaLink(waNumber: string, text?: string): string {
  if (!text) return `https://wa.me/${waNumber}`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

export function buildDonationMessage(program: string, pax: number, totalFormatted: string): string {
  return `Halo, saya ingin donasi program "${program}" untuk ${pax} pax (Total: ${totalFormatted}).`;
}

export function formatProgramOptionLabel(opt: { label: string; disabled: boolean }): string {
  return opt.disabled ? `${opt.label} (Segera Hadir)` : opt.label;
}
