import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BalanceService } from 'src/app/services/balance.service';
import { Balance } from 'src/app/models/balance.model';
import { MenuService } from 'src/app/services/menu.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { DatabaseService } from 'src/app/services/database.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  loading = true;
  dashboard: any = null;
  email: any;
  user: any = null;
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();
  userFirstName: string = '';
  totalTodayExpense: number = 0;
  totalMonthExpense: number = 0;
  totalYearExpense: number = 0;
  totalBalance: number = 0;
  creditTotal: number = 0;
  debitTotal: number = 0;
  userBalance: number = 0;
  monthSaving: number = 0;
  yearSaving: number = 0;
  balances: Balance[] = [];
  activeTab: string = 'expenses';

  // New count properties
  creditCardsCount: number = 0;
  debitCardsCount: number = 0;
  invoicesCount: number = 0;
  splitExpensesCount: number = 0;
  expenseCategoriesCount: { [key: string]: number } = {};
  transactionTypesCount: { [key: string]: number } = {};

  // Filter properties
  showFilters: boolean = false;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];

  // Raw data for filtering
  allExpenses: any[] = [];
  allTransactions: any[] = [];

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuService: MenuService,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private transactionService: TransactionService,
    private databaseService: DatabaseService
  ) {

  }

  loadDashboard(month?: number, year?: number) {
    this.loading = true;
    this.authService.getDashboard(month, year).subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard = res;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });
  }
  async ngOnInit() {
    this.currentMonth = this.getMonthName(new Date().getMonth());
    console.log('Current Month:', this.currentMonth);

    this.loading = true;

    try {
      // Load dashboard data from the API
      const dashboardRes = await this.authService.getDashboard().toPromise();

      if (dashboardRes?.success) {
        this.dashboard = dashboardRes;

        // Map user data
        this.user = dashboardRes.user;
        this.userFirstName = this.user?.name?.split(' ')[0] || '';
        this.email = this.user?.email || '';

        // Map financial data
        this.totalBalance = dashboardRes.totals?.balance || 0;
        this.totalTodayExpense = dashboardRes.totals?.today_expense || 0;
        this.totalMonthExpense = dashboardRes.totals?.month_expense || 0;
        this.totalYearExpense = dashboardRes.totals?.year_expense || 0;
        this.monthSaving = dashboardRes.totals?.month_saving || 0;
        this.yearSaving = dashboardRes.totals?.year_saving || 0;

        // Map recent balances
        this.balances = dashboardRes.recent?.balances || [];

        // Map expenses and transactions for filtering
        this.allExpenses = dashboardRes.recent?.expenses || [];
        this.allTransactions = dashboardRes.recent?.transactions || [];

        // Calculate credits and debits from transactions
        this.updateCalculations();

        // Fetch additional counts from database service
        await this.loadAdditionalCounts();
      } else {
        this.showToast('Failed to load dashboard data', 'danger');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showToast('Failed to load financial data', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async loadAdditionalCounts() {
    try {
      const [creditCards, debitCards, invoices, splitExpenses] = await Promise.all([
        this.databaseService.getAllCreditCards(),
        this.databaseService.getAllDebitCards(),
        this.databaseService.getInvoices(),
        this.databaseService.getSplitExpenses()
      ]);

      this.creditCardsCount = creditCards.length;
      this.debitCardsCount = debitCards.length;
      this.invoicesCount = invoices.length;
      this.splitExpensesCount = splitExpenses.length;

      // Calculate expense categories count
      this.expenseCategoriesCount = {};
      this.allExpenses.forEach(exp => {
        if (exp.category) {
          this.expenseCategoriesCount[exp.category] = (this.expenseCategoriesCount[exp.category] || 0) + 1;
        }
      });

      // Calculate transaction types count
      this.transactionTypesCount = {};
      this.allTransactions.forEach(tr => {
        if (tr.type) {
          this.transactionTypesCount[tr.type] = (this.transactionTypesCount[tr.type] || 0) + 1;
        }
      });

    } catch (error) {
      console.error('Error loading additional counts:', error);
    }
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || 'Unknown';
  }

  async refreshData() {
    await this.ngOnInit();
  }

  async calculateCreditsAndDebits() {
    // This is now handled in ngOnInit
  }

  sumExpenses(expenses: any[], filter?: 'month' | 'year'): number {
    const now = new Date();
    return expenses.reduce((sum, expense) => {
      const date = new Date(expense.date);
      if (!filter || 
         (filter === 'month' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) ||
         (filter === 'year' && date.getFullYear() === now.getFullYear())) {
        return sum + (expense?.amount || 0);
      }
      return sum;
    }, 0);
  }

  calculateSavings() {
    this.monthSaving = this.totalBalance - this.totalMonthExpense;
    this.yearSaving = this.totalBalance - this.totalYearExpense;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.updateCalculations();
    this.showFilters = false;
    this.showToast('Filters applied successfully!');
  }

  resetFilters() {
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.selectedCategory = 'All';
    this.updateCalculations();
    this.showToast('Filters reset!');
  }

  updateCalculations() {
    // Filter expenses based on selected month, year, category
    let filteredExpenses = this.allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      const matchesMonth = expDate.getMonth() + 1 === this.selectedMonth;
      const matchesYear = expDate.getFullYear() === this.selectedYear;
      const matchesCategory = this.selectedCategory === 'All' || exp.category === this.selectedCategory;
      return matchesMonth && matchesYear && matchesCategory;
    });

    // Recalculate totals
    this.totalMonthExpense = this.sumExpenses(filteredExpenses);
    this.totalTodayExpense = this.sumExpenses(filteredExpenses.filter(exp =>
      new Date(exp.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    ));

    // For year, filter by year
    let yearFiltered = this.allExpenses.filter(exp => new Date(exp.date).getFullYear() === this.selectedYear);
    this.totalYearExpense = this.sumExpenses(yearFiltered);

    // Transactions similar
    let filteredTransactions = this.allTransactions.filter(tr => {
      const trDate = new Date(tr.date);
      return (trDate.getMonth() + 1 === this.selectedMonth) && (trDate.getFullYear() === this.selectedYear);
    });

    const credits = filteredTransactions.filter(t => t.type === 'credit');
    const debits = filteredTransactions.filter(t => t.type === 'debit');

    this.creditTotal = this.sumExpenses(credits);
    this.debitTotal = this.sumExpenses(debits);
    this.userBalance = this.creditTotal - this.debitTotal;

    this.calculateSavings();
  }

  // navigateTo(path: string) {
  //   this.router.navigate([path]);
  // }
  
  async editBalance(balance: Balance) {
    if (!balance.id) {
      this.showToast('Error: Invalid Balance ID');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Edit Balance',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          value: balance.amount,
          placeholder: 'Enter new amount',
        },
        {
          name: 'source',
          type: 'text',
          value: balance.source ?? '',
          placeholder: 'Enter new source',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.amount && data.source) {
              try {
                console.log('Updating Balance:', balance.id, data.amount, data.source);
                const response = await this.balanceService.updateBalance(balance.id!.toString(), {
                  amount: parseFloat(data.amount),
                  source: data.source ?? '',
                  date_added: balance.date_added!
                }).toPromise();

                if (response?.success) {
                  // await this.loadBalance(); // Refresh UI
                  this.showToast('Balance updated successfully!');
                } else {
                  this.showToast('Failed to update balance!');
                }
              } catch (error) {
                console.error('Error updating balance:', error);
                this.showToast('Error updating balance!');
              }
            } else {
              this.showToast('Amount and Source are required!');
            }
          },
        },
      ],
    });
    await alert.present();
  }
  
  
  async deleteBalance(balanceId?: string) {
    if (!balanceId) {
      this.showToast('Error: Invalid Balance ID');
      return;
    }
  
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this balance?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              console.log('Deleting Balance with ID:', balanceId);
              const response = await this.balanceService.deleteBalance(balanceId).toPromise();
              if (response?.success) {
                // await this.loadBalance(); // 🔥 Refresh UI to reflect deletion
                this.showToast('Balance deleted successfully!');
              } else {
                this.showToast('Failed to delete balance!');
              }
            } catch (error) {
              console.error('Error deleting balance:', error);
              this.showToast('Error deleting balance!');
            }
          },
        },
      ],
    });
    await alert.present();
  }
  
  openMenu() {
    this.menuService.openMenu();
  }

  closeMenu() {
    this.menuService.closeMenu();
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }
  navigateTo(route: string) {
    this.navCtrl.navigateRoot(route);
    this.activeTab = this.getTabName(route);
  }
  
  getTabName(route: string): string {
    switch (route) {
      case '/single-view-expenses':
        return 'expenses';
      case '/multi-view-expense':
        return 'add';
      case '/split-view':
        return 'split';
      case '/scan':
        return 'scan';
      case '/balance':
        return 'balance';
      default:
        return 'expenses';
    }
  }
  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout Confirmation',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
        handler: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('loginTime');
            sessionStorage.removeItem('rememberMe');
            this.router.navigateByUrl('/login', { replaceUrl: true });
          }
        }
      ]
    });
  
    await alert.present();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  // Utility method to get object keys for template iteration
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
