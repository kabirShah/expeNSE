import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../../../services/database.service';
import { ExpenseService } from 'src/app/services/expense.service';

@Component({
  selector: 'app-single-expense',
  templateUrl: './single-expense.page.html',
})
export class SingleExpensePage implements OnInit {
  expenseForm!: FormGroup;
  expenseCategories = [
    'Utilities', 'Clothes Shopping', 'Entertainment', 'Groceries',
    'Miscellaneous', 'Rent', 'Transport', 'Healthcare',
    'Dining Out', 'Education', 'Personal Care', 'Savings & Investments',
    'Subscriptions', 'Household Supplies', 'Travel'
  ];
  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];
  expenseId: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private db: DatabaseService,
    private router: Router,
    private route:ActivatedRoute,
    private toastCtrl: ToastController,
    private expService: ExpenseService
  ) {}

  ngOnInit() {
    this.createForm();
    this.expenseId = this.route.snapshot.paramMap.get('id');
    console.log(this.expenseId);
    if(this.expenseId){
      this.loadExpense(this.expenseId);
    }
  }
  async loadExpense(id:string){
    try{
      const expense  = await this.db.getExpense(id);
      if (expense ) {
        this.expenseForm.patchValue(expense );
      }
    } catch (error){
      console.error(' Error Loading Expenses ',error);
    }

  }
  createForm() {
    this.expenseForm = this.fb.group({
      date: [new Date().toISOString(), Validators.required],
      category: ['', Validators.required],
      transaction_type: ['', Validators.required], // <-- Rename here
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      notes: [''],
      _id: [''],
      _rev:['']
    });
    
  }

  async saveExpense() {
    if (this.expenseForm.invalid) {
      await this.showToast('Please enter a valid expense!', 'danger');
      return;
    }
  
    const expense = this.expenseForm.value;
  
    try {
      // Add to PouchDB
      delete expense._rev;
      const response = await this.db.addManualExpense(expense);
      console.log('Expense added to PouchDB:', response);
  
      // Sync to Laravel API
      const apiResponse = await this.expService.createExpense(expense).toPromise();
      console.log('Expense created via API:', apiResponse);
  
      await this.showToast('Expense Added Successfully', 'success');
      this.expenseForm.reset();
      this.navCtrl.navigateBack('/single-view-expenses');
  
    } catch (error) {
      console.error('Error saving expense', error);
      await this.showToast('Failed to sync with server', 'danger');
    }
  }
  
  
  

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
