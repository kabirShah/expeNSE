export interface BudgetPlan {
  _id?: string;
  _rev?: string;
  month: string; // e.g. 2025-08
  monthlyBudget: number;
  dreamGoalName?: string;
  dreamGoalTarget?: number; // total target amount
  dreamGoalSaved?: number; // saved so far
  createdAt?: string;
  updatedAt?: string;
}

