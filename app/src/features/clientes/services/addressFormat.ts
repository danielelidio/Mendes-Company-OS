import type { ClientAddress } from '../types';

function isBrazil(addr: ClientAddress): boolean {
  return (addr.country ?? '').toUpperCase() === 'BR';
}

function countryLabel(country: string | null): string | null {
  if (!country) return null;
  return country.toUpperCase() === 'EX' ? 'Exterior' : country.toUpperCase();
}

/** Formats an address differently for Brazilian vs foreign clients. */
export function formatAddress(addr: ClientAddress | null): string {
  if (!addr) return '—';
  const parts: string[] = [];
  const line1 = [addr.street, addr.number].filter(Boolean).join(', ');
  if (line1) parts.push(line1);
  if (addr.complement) parts.push(addr.complement);
  if (addr.district) parts.push(addr.district);

  if (isBrazil(addr)) {
    const cityState = [addr.city, addr.state].filter(Boolean).join('/');
    if (cityState) parts.push(cityState);
    if (addr.zip) parts.push(`CEP ${addr.zip}`);
  } else {
    const cityState = [addr.city, [addr.state, addr.zip].filter(Boolean).join(' ').trim()]
      .filter(Boolean)
      .join(', ');
    if (cityState) parts.push(cityState);
    const country = countryLabel(addr.country);
    if (country) parts.push(country);
  }

  return parts.length ? parts.join(' · ') : '—';
}
