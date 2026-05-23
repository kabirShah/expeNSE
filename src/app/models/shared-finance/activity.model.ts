export type SharedActivityType = 'expense_added' | 'settlement_completed' | 'user_joined' | 'group_updated';

export interface SharedActivityModel {
  id: number;
  type: SharedActivityType;
  title: string;
  description: string;
  amount?: number;
  actorName: string;
  groupName?: string;
  createdAt: string;
}
