/**
 * GamesByVT — Guest-Only Authentication & Stable UID Service
 * Developer: Bodepudi Varun Teja
 *
 * Implements guest authentication:
 * - Automatically initializes guest identity on first visit.
 * - Restores existing stable UID upon browser reload.
 * - Generates actual dynamic UID and shortened format e.g. G-7F2A91C4.
 * - Display names are labels only; UID is the internal player identity.
 */

const STORAGE_KEY_GUEST = 'gamesbyvt_guest_identity';

export interface GuestIdentity {
  uid: string;
  shortUid: string;
  displayName: string;
  createdAt: number;
}

/**
 * Format standard UID into a human-readable shortened format e.g. G-7F2A91C4
 */
export function formatShortUid(uid: string): string {
  if (!uid) return 'G-00000000';
  // Strip any existing prefix
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const suffix = clean.slice(-8).padStart(8, '0');
  return `G-${suffix}`;
}

/**
 * Generate a dynamic guest UID
 */
function generateDynamicGuestUid(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `guest_${timestamp}_${randomPart}`;
}

/**
 * Initialize or restore the persistent guest identity
 */
export function initGuestIdentity(): GuestIdentity {
  if (typeof window === 'undefined') {
    const fallbackUid = generateDynamicGuestUid();
    return {
      uid: fallbackUid,
      shortUid: formatShortUid(fallbackUid),
      displayName: '',
      createdAt: Date.now(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST);
    if (raw) {
      const parsed = JSON.parse(raw) as GuestIdentity;
      if (parsed && parsed.uid) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read guest session from localStorage', err);
  }

  // Create new unique guest identity
  const newUid = generateDynamicGuestUid();
  const identity: GuestIdentity = {
    uid: newUid,
    shortUid: formatShortUid(newUid),
    displayName: '',
    createdAt: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(identity));
  } catch {}

  return identity;
}

/**
 * Get current stored guest identity
 */
export function getGuestIdentity(): GuestIdentity {
  return initGuestIdentity();
}

/**
 * Set and persist the guest's display name
 */
export function setGuestDisplayName(displayName: string): GuestIdentity {
  const current = getGuestIdentity();
  const updated: GuestIdentity = {
    ...current,
    displayName: displayName.trim(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(updated));
  } catch {}

  return updated;
}

/**
 * Copy UID to clipboard helper
 */
export async function copyUidToClipboard(uid: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(uid);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stable CSS avatar color generator based on UID
 */
export function getAvatarColorForUid(uid: string): string {
  const colors = [
    '#4169E1', // Royal Blue
    '#2E7D32', // Forest Green
    '#C2410C', // Rust
    '#7C3AED', // Violet
    '#0891B2', // Cyan
    '#D97706', // Amber
    '#475569', // Slate
    '#BE185D', // Rose
  ];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash << 5) - hash + uid.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
