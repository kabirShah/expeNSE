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
    
    await this.loadBalance();
    await this.loadExpenses();
    this.calculateSavings();
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

  async loadBudget() {
    const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    this.budget = await this.db.getBudget(monthKey);
    this.monthlyBudget = this.budget?.monthlyBudget || 0;
    this.dreamGoalName = this.budget?.dreamGoalName || '';
    this.dreamGoalTarget = this.budget?.dreamGoalTarget || 0;
    this.dreamGoalSaved = this.budget?.dreamGoalSaved || 0;
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

  computeBankUsage() {
    // Derive from expenses' transactionType or notes containing bank names
    const banks = ['Kotak', 'ICICI', 'HDFC'];
    this.bankUsage = { Kotak: 0, ICICI: 0, HDFC: 0 };
    // Fetch all expenses and aggregate by bank keyword in description/notes/transactionType
    // For simplicity, use getAllExpenses() which pulls manual expenses
    this.db.getAllExpenses().then(expenses => {
      expenses.forEach((exp: any) => {
        const text = `${exp.transactionType || ''} ${exp.description || ''} ${exp.notes || ''}`.toLowerCase();
        banks.forEach(bank => {
          if (text.includes(bank.toLowerCase())) {
            this.bankUsage[bank] = (this.bankUsage[bank] || 0) + (exp.amount || 0);
          }
        });
      });
    });
  }

  async editBudget() {
    const alert = await this.alertCtrl.create({
      header: 'Edit Budget & Goal',
      inputs: [
        { name: 'monthlyBudget', type: 'number', value: this.monthlyBudget, placeholder: 'Monthly Budget (₹)' },
        { name: 'dreamGoalName', type: 'text', value: this.dreamGoalName, placeholder: 'Dream Goal Name' },
        { name: 'dreamGoalTarget', type: 'number', value: this.dreamGoalTarget, placeholder: 'Goal Target (₹)' },
        { name: 'dreamGoalSaved', type: 'number', value: this.dreamGoalSaved, placeholder: 'Saved So Far (₹)' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save', handler: async (data) => {
            const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
            const plan: BudgetPlan = {
              _id: this.budget?._id || monthKey,
              _rev: this.budget?._rev,
              month: monthKey,
              monthlyBudget: Number(data.monthlyBudget) || 0,
              dreamGoalName: (data.dreamGoalName || '').trim(),
              dreamGoalTarget: Number(data.dreamGoalTarget) || 0,
              dreamGoalSaved: Number(data.dreamGoalSaved) || 0,
            };
            await this.db.upsertBudget(plan);
            await this.loadBudget();
            this.showToast('Budget updated');
          }
        }
      ]
    });
    await alert.present();
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