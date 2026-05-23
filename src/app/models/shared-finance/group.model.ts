export type SharedGroupType = 'home' | 'trip' | 'friends' | 'family' | 'office' | 'custom';

export interface SharedGroupModel {
  id: number;
  name: string;
  type: SharedGroupType;
  memberCount: number;
  totalSpend: number;
  balance: number;
  updatedAt: string;
  color: string;
}
