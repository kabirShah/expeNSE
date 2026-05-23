export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

export interface SettlementModel {
  id: number;
  fromName: string;
  toName: string;
  amount: number;
  status: SettlementStatus;
  groupName?: string;
  createdAt: string;
  completedAt?: string;
}
