export type SplitMode = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitParticipantModel {
  id: number;
  name: string;
  amount?: number | null;
  percentage?: number | null;
  shares?: number | null;
  calculatedAmount: number;
}

export interface ExpenseSplitModel {
  amount: number;
  mode: SplitMode;
  participants: SplitParticipantModel[];
  totalAssigned: number;
  remainingAmount: number;
  isBalanced: boolean;
}
