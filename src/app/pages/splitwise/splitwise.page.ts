import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import {
  SplitwiseBalanceSummary,
  SplitwiseExpense,
  SplitwiseGroup,
  SplitwiseGroupMember,
  SplitwiseSettlement,
} from 'src/app/models/splitwise.model';
import { SplitwiseService } from 'src/app/services/splitwise.service';

@Component({
  selector: 'app-splitwise',
  templateUrl: './splitwise.page.html',
  styleUrls: ['./splitwise.page.scss'],
})
export class SplitwisePage implements OnInit {
  isLoading = false;
  groups: SplitwiseGroup[] = [];
  selectedGroupId: number | null = null;
  selectedGroup: SplitwiseGroup | null = null;
  expenses: SplitwiseExpense[] = [];
  settlements: SplitwiseSettlement[] = [];
  balances: SplitwiseBalanceSummary | null = null;

  createGroupForm = {
    name: '',
    description: '',
  };

  expenseForm = {
    title: '',
    amount: null as number | null,
    expense_date: new Date().toISOString().slice(0, 10),
    paid_by_member_id: null as number | null,
  };

  settlementForm = {
    payer_member_id: null as number | null,
    payee_member_id: null as number | null,
    amount: null as number | null,
    settled_at: new Date().toISOString().slice(0, 10),
    note: '',
  };

  constructor(
    private splitwiseService: SplitwiseService,
    private toastController: ToastController,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading = true;

    this.splitwiseService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.data ?? [];
        this.selectedGroupId = this.selectedGroupId ?? this.groups[0]?.id ?? null;
        this.isLoading = false;

        if (this.selectedGroupId) {
          this.loadGroupWorkspace(this.selectedGroupId);
        }
      },
      error: () => {
        this.isLoading = false;
        void this.presentToast('Unable to load Splitwise groups right now.');
      },
    });
  }

  onGroupChange(): void {
    if (this.selectedGroupId) {
      this.loadGroupWorkspace(this.selectedGroupId);
    }
  }

  createGroup(): void {
    if (!this.createGroupForm.name.trim()) {
      void this.presentToast('Group name is required.');
      return;
    }

    this.splitwiseService.createGroup({
      name: this.createGroupForm.name.trim(),
      description: this.createGroupForm.description.trim() || undefined,
    }).subscribe({
      next: (response) => {
        const group = response.data;
        this.groups = [group, ...this.groups];
        this.selectedGroupId = group.id;
        this.createGroupForm = { name: '', description: '' };
        this.loadGroupWorkspace(group.id);
        void this.presentToast('Splitwise group created.');
      },
      error: () => {
        void this.presentToast('Unable to create the Splitwise group.');
      },
    });
  }

  createExpense(): void {
    if (!this.selectedGroup || !this.expenseForm.title.trim() || !this.expenseForm.amount || !this.expenseForm.paid_by_member_id) {
      void this.presentToast('Expense title, amount, and payer are required.');
      return;
    }

    const members = this.selectedGroup.members ?? [];
    const totalAmount = this.expenseForm.amount;
    const amountPerMember = this.roundCurrency(totalAmount / Math.max(members.length, 1));
    const splits = members.map((member, index) => {
      const isLast = index === members.length - 1;
      const previousTotal = amountPerMember * index;
      const amountOwed = isLast
        ? this.roundCurrency(totalAmount - previousTotal)
        : amountPerMember;

      return {
        member_id: member.id,
        amount_owed: amountOwed,
      };
    });

    this.splitwiseService.createExpense({
      group_id: this.selectedGroup.id,
      paid_by_member_id: this.expenseForm.paid_by_member_id,
      title: this.expenseForm.title.trim(),
      amount: totalAmount,
      expense_date: this.expenseForm.expense_date,
      splits,
    }).subscribe({
      next: () => {
        const currentGroupId = this.selectedGroup?.id;

        this.expenseForm = {
          title: '',
          amount: null,
          expense_date: new Date().toISOString().slice(0, 10),
          paid_by_member_id: this.selectedGroup?.members?.[0]?.id ?? null,
        };
        if (currentGroupId) {
          this.loadGroupWorkspace(currentGroupId);
        }
        void this.presentToast('Splitwise expense saved.');
      },
      error: () => {
        void this.presentToast('Unable to save the Splitwise expense.');
      },
    });
  }

  createSettlement(): void {
    if (!this.selectedGroup || !this.settlementForm.payer_member_id || !this.settlementForm.payee_member_id || !this.settlementForm.amount) {
      void this.presentToast('Settlement payer, payee, and amount are required.');
      return;
    }

    this.splitwiseService.createSettlement({
      group_id: this.selectedGroup.id,
      payer_member_id: this.settlementForm.payer_member_id,
      payee_member_id: this.settlementForm.payee_member_id,
      amount: this.settlementForm.amount,
      settled_at: this.settlementForm.settled_at,
      note: this.settlementForm.note.trim() || undefined,
    }).subscribe({
      next: () => {
        const currentGroupId = this.selectedGroup?.id;

        this.settlementForm = {
          payer_member_id: null,
          payee_member_id: null,
          amount: null,
          settled_at: new Date().toISOString().slice(0, 10),
          note: '',
        };
        if (currentGroupId) {
          this.loadGroupWorkspace(currentGroupId);
        }
        void this.presentToast('Settlement recorded.');
      },
      error: () => {
        void this.presentToast('Unable to record the settlement.');
      },
    });
  }

  members(): SplitwiseGroupMember[] {
    return this.selectedGroup?.members ?? [];
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  private loadGroupWorkspace(groupId: number): void {
    this.isLoading = true;

    this.splitwiseService.getGroup(groupId).subscribe({
      next: (groupResponse) => {
        this.selectedGroup = groupResponse.data;
        this.expenseForm.paid_by_member_id = this.expenseForm.paid_by_member_id ?? this.selectedGroup.members?.[0]?.id ?? null;
        this.settlementForm.payer_member_id = this.settlementForm.payer_member_id ?? this.selectedGroup.members?.[0]?.id ?? null;
        this.settlementForm.payee_member_id = this.settlementForm.payee_member_id ?? this.selectedGroup.members?.[1]?.id ?? this.selectedGroup.members?.[0]?.id ?? null;
        this.loadExpenses(groupId);
        this.loadBalances(groupId);
        this.loadSettlements(groupId);
      },
      error: () => {
        this.isLoading = false;
        void this.presentToast('Unable to load the selected Splitwise group.');
      },
    });
  }

  private loadExpenses(groupId: number): void {
    this.splitwiseService.getExpenses(groupId).subscribe({
      next: (response) => {
        this.expenses = response.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadBalances(groupId: number): void {
    this.splitwiseService.getBalances(groupId).subscribe({
      next: (response) => {
        this.balances = response.data ?? null;
      },
    });
  }

  private loadSettlements(groupId: number): void {
    this.splitwiseService.getSettlements(groupId).subscribe({
      next: (response) => {
        this.settlements = response.data ?? [];
      },
    });
  }

  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });

    await toast.present();
  }
}
