import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface QuickAction {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-expenses-preview',
  templateUrl: './expenses-preview.page.html',
  styleUrls: ['./expenses-preview.page.scss'],
})
export class ExpensesPreviewPage {

  readonly actions: QuickAction[] = [
    {
      title: 'Expense',
      subtitle: 'Add expense',
      icon: 'receipt-outline',
      color: 'green',
      route: '/single-view-expenses'
    },
    {
      title: 'Income',
      subtitle: 'Add income',
      icon: 'cash-outline',
      color: 'teal',
      route: '/balance'
    },
    {
      title: 'Receipt',
      subtitle: 'Scan receipt',
      icon: 'camera-outline',
      color: 'yellow',
      route: '/receipt'
    },
    {
      title: 'Voice',
      subtitle: 'Voice entry',
      icon: 'mic-outline',
      color: 'purple',
      route: '/voice-entry'
    },
    {
      title: 'Multi Expense',
      subtitle: 'Add multiple expenses',
      icon: 'list-outline',
      color: 'blue',
      route: '/multi-view-expense'
    },
    {
      title: 'Routine',
      subtitle: 'Recurring expenses',
      icon: 'repeat-outline',
      color: 'orange',
      route: '/routine-expenses'
    }
  ];

  constructor(
    private router: Router
  ) {}

  /**
   * Navigate to selected page
   */
  navigateTo(route: string): void {
    void this.router.navigate([route]);
  }

  /**
   * Back navigation
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * TrackBy for performance
   */
  trackByAction(index: number, action: QuickAction): string {
    return action.route;
  }
}