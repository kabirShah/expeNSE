export interface SharedFinanceAnalyticsModel {
  netBalance: number;
  totalReceivable: number;
  totalOwed: number;
  monthlySpend: number;
  groupTotal: number;
  friendTotal: number;
  activeGroups: number;
  trend: Array<{ label: string; amount: number }>;
}
