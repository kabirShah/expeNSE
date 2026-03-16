import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SplitService } from 'src/app/services/split.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-split-view',
  templateUrl: './split-view.page.html',
  styleUrls: ['./split-view.page.scss'],
})
export class SplitViewPage implements OnInit {
  splitExpenses: any[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private splitService: SplitService,
    private uiToast: UiToastService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadExpenses();
  }

  async loadExpenses() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(this.splitService.getSplits());
      this.splitExpenses = res?.success ? (res.data || []) : [];
    } catch (error) {
      console.error('Failed to load split expenses', error);
      this.hasError = true;
      this.errorMessage = 'Unable to load split expenses.';
      await this.showToast('Failed to load split expenses.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteExpense(id: number | string) {
    try {
      const res = await firstValueFrom(this.splitService.deleteSplit(String(id)));
      if (res?.success) {
        this.splitExpenses = this.splitExpenses.filter((item) => String(item.id) !== String(id));
        await this.showToast('Split expense deleted.', 'success');
      } else {
        await this.showToast('Delete failed.', 'danger');
      }
    } catch (error) {
      console.error('Failed to delete split expense', error);
      await this.showToast('Delete failed.', 'danger');
    }
  }

  addSplit() {
    this.router.navigate(['/split']);
  }

  trackBySplitId(_: number, item: any): number | string {
    return item.id;
  }

  retryLoad() {
    this.loadExpenses();
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium') {
    await this.uiToast.show(message, color);
  }
}
