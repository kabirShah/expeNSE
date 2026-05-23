import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AAConnectedAccount } from 'src/app/services/aa.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {
  account: AAConnectedAccount | null = null;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    this.account = (navigation?.extras?.state?.['account'] as AAConnectedAccount | null) || history.state?.account || null;
  }

  accountLabel(): string {
    if (!this.account?.masked_account_number) {
      return 'Account details will appear after the next sync.';
    }

    const digits = this.account.masked_account_number.slice(-4);
    return `•••• ${digits}`;
  }
}
