/** Promo digests only — plaintext codes are not stored in the client. */
const PROMO_SALT = 'sportivia-promo-v1';

export interface PromoReward {
  id: string;
  coins: number;
  label: string;
  /** Owner / QA — grants every catalog card for collection review */
  unlockAllCards?: boolean;
}

/** SHA-256 digests of normalized codes (uppercase, no spaces/dashes). */
const PROMO_BY_DIGEST: Record<string, PromoReward> = {
  '1f2888766edd09d9f6ed7dc71d4e726eca6c01b984f2dfd02a9c4c35f6f8d77e': {
    id: 'promo-qx7m',
    coins: 12_000,
    label: '12,000 coins',
  },
  '477c7eaac09b2fcd59790fef40d34a79adb28c2c4480b25cbdd3ecc612ee3bb2': {
    id: 'promo-j4r8',
    coins: 28_000,
    label: '28,000 coins',
  },
  'e333987e7da54ecaee6723a139fb8111aa8d3da1ed3e60c8433253ff5fa265a2': {
    id: 'promo-h9zf',
    coins: 75_000,
    label: '75,000 coins',
  },
  'ff21307a3ae136ac56e8347cc334845219d3131ce5404f75cfb76531d33c5167': {
    id: 'promo-jk100',
    coins: 100_000,
    label: '100,000 coins',
  },
  '30caa2a9edd4df80fe7a14288da18083456b2a40063e4234b2fd73753e35c544': {
    id: 'promo-tester-500k',
    coins: 500_000,
    label: '500,000 tester coins',
  },
  '8d7616718a25a8db3681572e9908acf802c0501e725d9fc1c7061c2b1784770a': {
    id: 'promo-sportivia-500k',
    coins: 500_000,
    label: '500,000 coins',
  },
  '4f8042fec5530801b10893d06220a4b773efc081b1488156fb3200b15caeab48': {
    id: 'promo-owner-review-all',
    coins: 0,
    label: 'Full card collection',
    unlockAllCards: true,
  },
};

const REDEEMED_KEY = 'sportivia-promos-redeemed-v1';

export function normalizePromoCode(raw: string): string {
  return raw.replace(/[\s\-_]/g, '').toUpperCase();
}

async function digestPromo(normalized: string): Promise<string> {
  const data = new TextEncoder().encode(`${PROMO_SALT}|${normalized}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadRedeemed(): string[] {
  try {
    const raw = localStorage.getItem(REDEEMED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveRedeemed(ids: string[]) {
  try {
    localStorage.setItem(REDEEMED_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* ignore */
  }
}

export type PromoRedeemResult =
  | { ok: true; reward: PromoReward }
  | { ok: false; error: 'empty' | 'invalid' | 'used' };

export async function lookupPromo(raw: string): Promise<PromoRedeemResult> {
  const normalized = normalizePromoCode(raw);
  if (!normalized) return { ok: false, error: 'empty' };

  const digest = await digestPromo(normalized);
  const reward = PROMO_BY_DIGEST[digest];
  if (!reward) return { ok: false, error: 'invalid' };

  if (loadRedeemed().includes(reward.id)) return { ok: false, error: 'used' };
  return { ok: true, reward };
}

export function markPromoRedeemed(id: string) {
  saveRedeemed([...loadRedeemed(), id]);
}
