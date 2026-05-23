import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AAConnectedAccount, AaService } from 'src/app/services/aa.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {
  accounts: AAConnectedAccount[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly aaService: AaService,
    private readonly uiToast: UiToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAccounts();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.accounts = await firstValueFrom(this.aaService.fetchAccounts());
    } catch (error) {
      console.error('Failed to load connected accounts', error);
      this.errorMessage = 'Connected accounts could not be loaded. Please retry.';
      await this.uiToast.show(this.errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  balanceLabel(account: AAConnectedAccount): string {
    const balance = account.current_balance ?? account.available_balance ?? null;
    return balance === null || balance === undefined ? 'Balance syncing' : `Rs ${balance}`;
  }

  last4Label(account: AAConnectedAccount): string {
    if (!account.masked_account_number) {
      return 'Account ending unavailable';
    }

    return `A/C ending ${account.masked_account_number.slice(-4)}`;
  }
}
