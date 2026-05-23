import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AaService } from 'src/app/services/aa.service';
import { AATransaction } from 'src/app/models/aa-transaction.model';
import { AAAccount } from 'src/app/models/aa-account.model';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  transactions: AATransaction[] = [];
  accounts: AAAccount[] = [];
  selectedAccountId: number | null = null;
  isLoading = false;
  isRefreshing = false;
  errorMessage = '';
  
  // Pagination
  currentPage = 1;
  hasMore = true;
  pageSize = 20;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly aaService: AaService,
    private readonly uiToast: UiToastService
  ) {}

  async ngOnInit(): Promise<void> {
    const accountId = this.route.snapshot.queryParamMap.get('accountId');
    if (accountId) {
      this.selectedAccountId = parseInt(accountId, 10);
    }
    
    await this.loadAccounts();
    await this.loadTransactions();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadTransactions();
  }

  async loadAccounts(): Promise<void> {
    try {
      this.accounts = await firstValueFrom(this.aaService.getAccounts());
    } catch (error) {
      console.error('Failed to load accounts', error);
    }
  }

  async loadTransactions(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(
        this.aaService.getTransactions(this.selectedAccountId || undefined, this.currentPage, this.pageSize)
      );

      if (response?.success && response?.data) {
        if (this.currentPage === 1) {
          this.transactions = response.data;
        } else {
          this.transactions = [...this.transactions, ...response.data];
        }
        
        this.hasMore = response.data.length >= this.pageSize;
      }
    } catch (error) {
      console.error('Failed to load transactions', error);
      this.errorMessage = 'Could not load transactions. Please try again.';
      await this.uiToast.show(this.errorMessage, 'danger');
    } finally {
      this.isLoading = false;
      this.isRefreshing = false;
    }
  }

  async refreshTransactions(): Promise<void> {
    this.isRefreshing = true;
    this.currentPage = 1;
    await this.loadTransactions();
  }

  async loadMoreTransactions(): Promise<void> {
    if (!this.hasMore || this.isLoading) return;
    
    this.currentPage++;
    await this.loadTransactions();
  }

  async selectAccount(accountId: number | null): Promise<void> {
    this.selectedAccountId = accountId;
    this.currentPage = 1;
    this.transactions = [];
    await this.loadTransactions();
  }

  getSelectedAccount(): AAAccount | null {
    if (!this.selectedAccountId) return null;
    return this.accounts.find(a => a.id === this.selectedAccountId) || null;
  }

  formatAmount(amount: number, type: string): string {
    const prefix = type === 'CREDIT' ? '+' : '-';
    return `${prefix}Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getAmountColor(type: string): string {
    return type === 'CREDIT' ? 'success' : 'danger';
  }

  getTransactionIcon(type: string): string {
    return type === 'CREDIT' ? 'arrow-down-circle' : 'arrow-up-circle';
  }

  trackByTransactionId(index: number, transaction: AATransaction): string {
    return transaction.transaction_id;
  }
}