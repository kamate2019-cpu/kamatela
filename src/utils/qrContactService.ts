/**
 * KAMATELA - Personal Contact QR Code Service
 * Encodes and decodes KAMATELA contact payloads for instant in-person contact sharing.
 */

import type { User } from '@/types/kamatela';
import { mockUsers } from '@/services/kamatelaStore';

export interface QRContactPayload {
  app: 'kamatela';
  version: number;
  userId: string;
  name: string;
  handle: string;
  avatar: string;
  phone?: string;
  bio?: string;
  isBusiness?: boolean;
  businessName?: string;
  verified?: boolean;
}

/**
 * Generate standard QR code text for a KAMATELA user
 */
export function generateUserQRPayload(user: User): string {
  const payload: QRContactPayload = {
    app: 'kamatela',
    version: 1,
    userId: user.id,
    name: user.name,
    handle: user.handle,
    avatar: user.avatar,
    phone: user.businessPhone || '+1 (555) 019-8234',
    bio: user.bio,
    isBusiness: user.isBusiness,
    businessName: user.businessName,
    verified: user.verified,
  };

  return JSON.stringify(payload);
}

/**
 * Decode a QR text string into a User or null
 */
export function decodeContactQRPayload(qrText: string): User | null {
  try {
    const trimmed = qrText.trim();

    // 1. Try parsing structured JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const data = JSON.parse(trimmed) as Partial<QRContactPayload>;
      if (data.userId && data.name) {
        return {
          id: data.userId,
          name: data.name,
          handle: data.handle || `@${data.name.toLowerCase().replace(/\s+/g, '')}`,
          avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: data.bio || 'KAMATELA Member',
          coins: 500,
          isBusiness: Boolean(data.isBusiness),
          businessName: data.businessName,
          businessPhone: data.phone,
          verified: Boolean(data.verified),
          followersCount: 1200,
          followingCount: 300,
          likesCount: 5400,
        };
      }
    }

    // 2. Try parsing custom URI scheme (kamatela://contact?id=...&name=...)
    if (trimmed.startsWith('kamatela://') || trimmed.includes('kamatela.app/contact')) {
      const url = new URL(trimmed.replace('kamatela://', 'https://kamatela.app/'));
      const id = url.searchParams.get('id');
      const name = url.searchParams.get('name');
      if (id && name) {
        return {
          id,
          name,
          handle: url.searchParams.get('handle') || `@${name.toLowerCase().replace(/\s+/g, '')}`,
          avatar: url.searchParams.get('avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: url.searchParams.get('bio') || 'KAMATELA Member',
          coins: 500,
          isBusiness: url.searchParams.get('isBusiness') === 'true',
          businessPhone: url.searchParams.get('phone') || undefined,
          verified: url.searchParams.get('verified') === 'true',
          followersCount: 1500,
          followingCount: 200,
          likesCount: 8900,
        };
      }
    }

    // 3. Fallback: match by known user ID or name in mock database
    const matched = Object.values(mockUsers).find(
      (u) =>
        u.id === trimmed ||
        u.handle.toLowerCase() === trimmed.toLowerCase() ||
        u.name.toLowerCase() === trimmed.toLowerCase()
    );

    return matched || null;
  } catch (err) {
    console.warn('[QRContactService] Failed to decode QR payload:', err);
    return null;
  }
}

/**
 * Sample pre-generated contact QR profiles for instant simulation testing
 */
export const sampleQRContacts: { label: string; user: User; qrText: string }[] = [
  {
    label: 'Sophia Chen (Creator)',
    user: mockUsers.sophia,
    qrText: generateUserQRPayload(mockUsers.sophia),
  },
  {
    label: 'Chef Marcus (Business)',
    user: mockUsers.marcus,
    qrText: generateUserQRPayload(mockUsers.marcus),
  },
  {
    label: 'Luxe Audio Labs (Verified Brand)',
    user: mockUsers.zara,
    qrText: generateUserQRPayload(mockUsers.zara),
  },
  {
    label: 'Elena Rostova (Cyberpunk DJ)',
    user: mockUsers.elena,
    qrText: generateUserQRPayload(mockUsers.elena),
  },
];
