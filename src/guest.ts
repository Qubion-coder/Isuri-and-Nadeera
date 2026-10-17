import { BRIDE_NAME, GROOM_NAME } from './config';

// `code` is the short value stored in the link (?p=...), `label` is shown in the admin dropdown.
export const PREFIXES = [
  { code: 'mr', label: 'Mr.' },
  { code: 'mrs', label: 'Mrs.' },
  { code: 'miss', label: 'Miss' },
  { code: 'mrmrs', label: 'Mr. & Mrs.' },
  { code: 'family', label: 'Family' },
  { code: 'dear', label: 'Dear' },
] as const;

export type PrefixCode = (typeof PREFIXES)[number]['code'];

const findPrefix = (value: string | null) =>
  PREFIXES.find((p) => p.code === value?.toLowerCase() || p.label.toLowerCase() === value?.toLowerCase());

/**
 * Combines prefix + name into the name shown to the guest.
 * "Dear" never becomes part of the name — the greeting adds "Dear" itself.
 */
export function buildDisplayName(prefix: PrefixCode, guestName: string): string {
  const name = guestName.trim().replace(/\s+/g, ' ');
  if (!name) return '';

  switch (prefix) {
    case 'family':
      return `${name} and Family`;
    case 'dear':
      return name;
    default:
      return `${findPrefix(prefix)!.label} ${name}`;
  }
}

/** {baseURL}/{guestName}?p={prefix} — the prefix is left out for "Dear". */
export function buildInviteLink(baseUrl: string, prefix: PrefixCode, guestName: string): string {
  const name = guestName.trim().replace(/\s+/g, ' ');
  const link = `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(name)}`;
  return prefix === 'dear' ? link : `${link}?p=${prefix}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${GROOM_NAME} & ${BRIDE_NAME}`;
}

/**
 * Reads the guest from the current URL.
 * Supports /{guestName}?p=mr and the older ?prefix=Mr.&name=John format.
 */
export function getGuestDisplayName(): string {
  const params = new URLSearchParams(window.location.search);

  let name = params.get('name') ?? '';
  if (!name) {
    const segment = window.location.pathname.split('/').filter(Boolean)[0] ?? '';
    try {
      name = decodeURIComponent(segment);
    } catch {
      name = segment;
    }
  }
  if (!name || name.toLowerCase() === 'admin') return '';

  const prefix = findPrefix(params.get('p') ?? params.get('prefix'));
  return buildDisplayName(prefix?.code ?? 'dear', name);
}
