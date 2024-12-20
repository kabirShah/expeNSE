import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../../../services/database.service';

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
    private toastCtrl: ToastController
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
      transactionType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      notes: [''],
      _id: [''],
      _rev:['']
    });
  }

  async saveExpense() {
    if (this.expenseForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please enter a valid expense!','danger');
      return;
    }
    
    const expense = this.expenseForm.value;
    try {
      if (this.expenseId) {
        const existingExpense = await this.db.getExpense(this.expenseId);
        
        if (existingExpense) {  // Type Guard Check
          expense._id = existingExpense._id;
          expense._rev = existingExpense._rev;
          await this.db.updateManualExpense(expense);
          await this.showToast('Expense Updated Successfully','success');
          console.log("Expense Updated");
        } else {
          await this.showToast('Expense not found','danger');
          console.error("Expense not found");
        }
      } else {
        delete expense._rev;
        await this.db.addManualExpense(expense);
        await this.showToast('Expense Added Successfully','success');
        console.log('Expense added successfully');
      }
      this.expenseForm.reset();
      this.navCtrl.navigateBack('/single-view-expenses');
    } catch (error) {
      console.error('Error saving expense', error);
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
