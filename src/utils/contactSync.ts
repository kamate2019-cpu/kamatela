/**
 * KAMATELA - Phone Contact Synchronization & Matching Service
 * Supports:
 * 1. Native W3C Contact Picker API (navigator.contacts.select)
 * 2. vCard (.vcf) address book file import
 * 3. Quick simulated address book for instant preview & testing
 * 4. Automatic friend matching with registered KAMATELA creators & users
 * 5. SMS & WhatsApp invitation links for non-registered contacts
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
    name: 'Sophia Chen',
    tel: '+1 (555) 234-8901',
    email: 'sophia@nomadtech.io',
  },
  {
    id: 'c_2',
    name: 'Chef Marcus',
    tel: '+1 (555) 782-9912',
    email: 'marcus@sauces.com',
  },
  {
    id: 'c_3',
    name: 'Luxe Audio Labs',
    tel: '+1 (800) 555-5893',
    email: 'support@luxeaudio.com',
  },
  {
    id: 'c_4',
    name: 'Elena Rostova',
    tel: '+1 (555) 492-3310',
    email: 'elena@cyberpunk.design',
  },
  {
    id: 'c_5',
    name: 'David Kim (College Friend)',
    tel: '+1 (555) 890-1234',
    email: 'david.kim@gmail.com',
  },
  {
    id: 'c_6',
    name: 'Amara Diop (Producer)',
    tel: '+254 712 345 678',
    email: 'amara.beats@nairobi.fm',
  },
  {
    id: 'c_7',
    name: 'Uncle Patrick',
    tel: '+1 (555) 304-9812',
  },
  {
    id: 'c_8',
    name: 'Grace Mwangi',
    tel: '+254 722 987 654',
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
 * Generate WhatsApp invite link
 */
export function getWhatsAppInviteUrl(phone: string, inviterName: string = 'A friend'): string {
  const clean = normalizePhone(phone);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kamatela.app';
  const message = `Hey! Join me on KAMATELA Super App. We can chat, make voice/video calls, and create AI music together! Check it out: ${appUrl}`;
  return `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
}
