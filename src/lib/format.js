export function euro(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n));
}

export function pct(n) {
  return `${Math.round(n)} %`;
}

export function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}
