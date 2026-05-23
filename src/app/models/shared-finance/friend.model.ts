export type SharedFriendStatus = 'accepted' | 'pending' | 'invited' | 'blocked';

export interface SharedFriendModel {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  status: SharedFriendStatus;
  isRegistered: boolean;
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: string;
  balance: number;
}

export interface SharedContactModel {
  id: number;
  deviceContactId: string;
  name: string;
  phone?: string;
  email?: string;
  isRegistered: boolean;
  isInvited: boolean;
  isFavorite: boolean;
  matchedUserId?: number;
}
