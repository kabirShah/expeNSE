import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
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
    private route:ActivatedRoute
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
      const doc = await this.db.getExpense('expenses', id);
      if (doc) {
        this.expenseForm.patchValue(doc);
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
      return;
    }
    const expense = this.expenseForm.value;
    console.log(expense);
    try {
      if (this.expenseId) {
        const existingExpense = await this.db.getExpense('expenses', this.expenseId);
        if(existingExpense){
          expense._id = existingExpense._id;
          expense._rev = existingExpense._rev;
          await this.db.updateManualExpense(expense);
          this.navCtrl.navigateBack('/single-view-expenses');
          console.log("Expense Updates");
        }else{
          await this.db.addManualExpense(expense);
        this.navCtrl.navigateBack('/single-view-expenses');
        console.log('Expense added manually successfully');
        }     
      }
      this.expenseForm.reset();
      this.navCtrl.navigateBack('/single-view-expenses'); 
    } catch (error) {
      console.error('Error saving expense', error);
    }
  }
}
