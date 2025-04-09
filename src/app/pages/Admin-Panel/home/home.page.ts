import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Balance } from 'src/app/models/balance.model';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  email: any;
  currentMonth: string = '';
  currentYear: number = new Date().getFullYear();
  
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
    private db: DatabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuService: MenuService
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

  async loadBalance() {
    try {
      const balanceDocs: Balance[] = await this.db.getAllBalances();
      if (balanceDocs.length > 0) {
        this.totalBalance = balanceDocs.reduce((sum, record) => sum + (record.amount || 0), 0);
        this.userBalance = this.totalBalance - this.totalMonthExpense;
        this.balances = balanceDocs.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); // Sort by date
      } else {
        this.totalBalance = 0;
        this.userBalance = 0;
        this.balances = [];
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }
  
  async loadExpenses() {
    const manualExpenses = await this.db.getAllManualExpenses();
    const todayStr = new Date().toISOString().split('T')[0];

    this.totalTodayExpense = this.sumExpenses(manualExpenses.filter(exp => exp.date.startsWith(todayStr)));
    this.totalMonthExpense = this.sumExpenses(manualExpenses, 'month');
    this.totalYearExpense = this.sumExpenses(manualExpenses, 'year');

    await this.calculateCreditsAndDebits();
  }

  async calculateCreditsAndDebits() {
    const credits = await this.db.getAllCredits();
    const debits = await this.db.getAllExpenses();

    this.creditTotal = this.sumExpenses(credits);
    this.debitTotal = this.sumExpenses(debits);
    this.userBalance = this.creditTotal - this.debitTotal;
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
          value: balance.source,
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
                await this.db.updateBalance({
                  _id: balance._id,
                  _rev: balance._rev, // Ensure _rev is passed
                  amount: data.amount,
                  source: data.source,
                  dateAdded: balance.dateAdded
                });
  
                await this.loadBalance(); // Refresh UI
                this.showToast('Balance updated successfully!');
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
              await this.db.deleteBalance(balanceId);
              await this.loadBalance(); // 🔥 Refresh UI to reflect deletion
              this.showToast('Balance deleted successfully!');
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
            localStorage.removeItem('isLoggedIn'); // Clear login status
            this.router.navigateByUrl('/login');   // Redirect to Login Page
          }
        }
      ]
    });
  
    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }
}