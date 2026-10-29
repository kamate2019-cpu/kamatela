/**
 * KAMATELA - Phone Contact Synchronization & Matching Service
 * Supports:
 * 1. Native W3C Contact Picker API (navigator.contacts.select)
 * 2. vCard (.vcf) address book file import
 * 3. Quick simulated address book for instant preview & testing
 * 4. Automatic friend matching with registered KAMATELA creators & users
 * 5. SMS & KAMATELA Chat invitation links for non-registered contacts
 */

import type { User } from '@/types/kamatela';
import { mockUsers } from '@/services/kamatelaStore';

export interface DeviceContact {
  id: string;
  name: string;
  tel: string;
  email?: string;
  matchedUser?: User;
}

export interface SyncResult {
  totalSynced: number;
  matched: DeviceContact[];
  unregistered: DeviceContact[];
}

// Built-in device sample contacts for instant one-click testing
export const sampleDeviceAddressBook: DeviceContact[] = [
  {
    id: 'c_1',
    name: 'KAMATELA Official Support',
    tel: '+225 07 00 12 34 56',
    email: 'support@kamatela.com',
  },
  {
    id: 'c_2',
    name: 'Mamadou Diallo',
    tel: '+224 622 11 22 33',
    email: 'mamadou@kamatela.net',
  },
  {
    id: 'c_3',
    name: 'Fatoumata Traore',
    tel: '+223 76 54 32 10',
    email: 'fatou@design.africa',
  },
  {
    id: 'c_4',
    name: 'Ibrahim Kamate',
    tel: '+225 05 88 99 00 11',
    email: 'ibrahim@kamate.org',
  },
  {
    id: 'c_5',
    name: 'Amina Osei',
    tel: '+233 24 123 4567',
    email: 'amina@accra.media',
  },
  {
    id: 'c_6',
    name: 'Sekou Toure',
    tel: '+224 628 99 88 77',
    email: 'sekou@conakry.net',
  },
  {
    id: 'c_7',
    name: 'Koffi Kouame',
    tel: '+225 07 44 55 66 77',
  },
  {
    id: 'c_8',
    name: 'Mariam Diabate',
    tel: '+223 66 11 22 33',
  },
];

// Clean phone string to digits for matching
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Check if the browser supports the W3C Contact Picker API
 */
export function isContactPickerSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    'ContactsManager' in window &&
    typeof (navigator as any).contacts?.select === 'function'
  );
}

/**
 * Request contacts from device via native Contact Picker API
 */
export async function pickNativeContacts(): Promise<DeviceContact[]> {
  if (!isContactPickerSupported()) {
    throw new Error('Contact Picker API is not supported on this browser or OS.');
  }

  const props = ['name', 'tel'];
  const opts = { multiple: true };

  const contacts = await (navigator as any).contacts.select(props, opts);
  if (!contacts || contacts.length === 0) {
    return [];
  }

  return contacts.map((c: any, index: number) => {
    const name = Array.isArray(c.name) ? c.name[0] : c.name || 'Unknown Contact';
    const tel = Array.isArray(c.tel) ? c.tel[0] : c.tel || '';
    return {
      id: `native_${Date.now()}_${index}`,
      name,
      tel,
    };
  });
}

/**
 * Parse a standard vCard (.vcf) address book file
 */
export function parseVCardText(vcardText: string): DeviceContact[] {
  const contacts: DeviceContact[] = [];
  const cards = vcardText.split(/BEGIN:VCARD/i);

  cards.forEach((card, idx) => {
    if (!card.trim()) return;

    let name = '';
    let tel = '';
    let email = '';

    const lines = card.split(/\r\n|\r|\n/);
    for (const line of lines) {
      if (line.match(/^FN:/i)) {
        name = line.replace(/^FN:/i, '').trim();
      } else if (!name && line.match(/^N:/i)) {
        const parts = line.replace(/^N:/i, '').split(';');
        name = parts.filter(Boolean).reverse().join(' ').trim();
      } else if (line.match(/^TEL/i)) {
        const match = line.split(':');
        if (match[1]) tel = match[1].trim();
      } else if (line.match(/^EMAIL/i)) {
        const match = line.split(':');
        if (match[1]) email = match[1].trim();
      }
    }

    if (name || tel) {
      contacts.push({
        id: `vcf_${Date.now()}_${idx}`,
        name: name || 'Contact ' + (idx + 1),
        tel: tel || '',
        email,
      });
    }
  });

  return contacts;
}

/**
 * Match a list of device contacts against KAMATELA registered users
 */
export function matchContactsWithUsers(
  deviceContacts: DeviceContact[],
  allUsers: User[] = Object.values(mockUsers)
): SyncResult {
  const matched: DeviceContact[] = [];
  const unregistered: DeviceContact[] = [];

  deviceContacts.forEach((contact) => {
    const cleanContactPhone = normalizePhone(contact.tel);
    const cleanContactName = contact.name.toLowerCase().trim();

    // Check if phone or name matches an existing user
    const matchedUser = allUsers.find((u) => {
      const uPhone = u.businessPhone ? normalizePhone(u.businessPhone) : '';
      if (uPhone && cleanContactPhone && (uPhone.includes(cleanContactPhone) || cleanContactPhone.includes(uPhone))) {
        return true;
      }
      if (cleanContactName && (u.name.toLowerCase().includes(cleanContactName) || cleanContactName.includes(u.name.toLowerCase()))) {
        return true;
      }
      return false;
    });

    if (matchedUser) {
      matched.push({
        ...contact,
        matchedUser,
      });
    } else {
      unregistered.push(contact);
    }
  });

  return {
    totalSynced: deviceContacts.length,
    matched,
    unregistered,
  };
}

/**
 * Generate SMS invite URI scheme
 */
export function getSmsInviteUrl(phone: string, inviterName: string = 'A friend'): string {
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kamatela.app';
  const message = `Hi! ${inviterName} invited you to KAMATELA Super App - chat, call, create AI music & live stream. Open: ${appUrl}`;
  return `sms:${phone}?body=${encodeURIComponent(message)}`;
}

/**
 * Generate KAMATELA Chat invite link
 */
export function getChatInviteUrl(phone: string, inviterName: string = 'A friend'): string {
  const clean = normalizePhone(phone);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kamatela.app';
  const message = `Hey! Join me on KAMATELA Super App. We can chat, make voice/video calls, and create AI music together! Check it out: ${appUrl}`;
  return `https://api.kamatela_chat.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
}
