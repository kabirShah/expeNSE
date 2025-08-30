import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BalanceService } from 'src/app/services/balance.service';
import { Balance } from 'src/app/models/balance.model';
import { MenuService } from 'src/app/services/menu.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
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
  activeTab: string = 'expenses'; // 🔹 Declare activeTab properly
  loading: boolean = false;

  constructor(
    private router: Router,
    private balanceService: BalanceService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuService: MenuService,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private transactionService: TransactionService
  ) {}

  async ngOnInit() {
    this.currentMonth = this.getMonthName(new Date().getMonth());
    console.log('Current Month:', this.currentMonth);
    
    this.loading = true;
    
    try {
      // Load profile, balances, and expenses in parallel
      const profile$ = this.authService.getProfile();
      const balances$ = this.balanceService.getBalances();
      const expenses$ = this.expenseService.getExpenses();
      const transactions$ = this.transactionService.getTransactions();
      
      const [profileRes, balanceRes, expenseRes, transactionRes] = await Promise.all([
        profile$?.toPromise().catch(err => {
          console.error('Error loading profile:', err);
          return null;
        }),
        balances$?.toPromise().catch(err => {
          console.error('Error loading balances:', err);
          return { success: false, data: [] };
        }),
        expenses$?.toPromise().catch(err => {
          console.error('Error loading expenses:', err);
          return { success: false, data: [] };
        }),
        transactions$?.toPromise().catch(err => {
          console.error('Error loading transactions:', err);
          return { success: false, data: [] };
        })
      ]);

      // Process profile
      if (profileRes) {
        this.user = profileRes.user;
        this.userFirstName = this.user?.name?.split(' ')[0] || '';
      }

      // Process balances
      if (balanceRes?.success) {
        const balanceDocs: Balance[] = balanceRes.data;
        if (balanceDocs.length > 0) {
          this.totalBalance = balanceDocs.reduce((sum, record) => sum + (record.amount || 0), 0);
          this.balances = balanceDocs.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        } else {
          this.totalBalance = 0;
          this.balances = [];
        }
      }

      // Process expenses
      if (expenseRes?.success) {
        const expenses = expenseRes.data;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        this.totalTodayExpense = this.sumExpenses(expenses.filter(exp => 
          new Date(exp.date).toISOString().split('T')[0] === todayStr
        ));
        
        this.totalMonthExpense = this.sumExpenses(expenses, 'month');
        this.totalYearExpense = this.sumExpenses(expenses, 'year');
      }

      // Process transactions for credits/debits
      if (transactionRes?.success) {
        const transactions = transactionRes.data;
        const credits = transactions.filter(t => t.type === 'credit');
        const debits = transactions.filter(t => t.type === 'debit');
        
        this.creditTotal = this.sumExpenses(credits);
        this.debitTotal = this.sumExpenses(debits);
        this.userBalance = this.creditTotal - this.debitTotal;
      }

      this.calculateSavings();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('Failed to load financial data', 'danger');
    } finally {
      this.loading = false;
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

  // navigateTo(path: string) {
  //   this.router.navigate([path]);
  // }
  
  async editBalance(balance: Balance) {
    if (!balance._id) {
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
                console.log('Updating Balance:', balance._id, data.amount, data.source);
                const response = await this.balanceService.updateBalance(balance._id!, {
                  _id: balance._id!,
                  _rev: balance._rev,
                  amount: parseFloat(data.amount),
                  source: data.source ?? '',
                  dateAdded: balance.dateAdded!,
                  userId: balance.userId!
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
}