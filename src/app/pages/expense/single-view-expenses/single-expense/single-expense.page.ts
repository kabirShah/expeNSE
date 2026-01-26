import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';

@Component({
  selector: 'app-single-expense',
  templateUrl: './single-expense.page.html',
  styleUrls: ['./single-expense.page.scss'],
  encapsulation: ViewEncapsulation.None // Critical for custom styles
})
export class SingleExpensePage implements OnInit {
  expenseForm!: FormGroup;
  expenseId: string | null = null;
  
  // Stores the processed categories (id, displayName)
  categories: any[] = []; 
  
  transactionTypes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Mobile Wallet'];

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private expService: ExpenseService
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadCategories(); // Load DB categories first
    
    this.expenseId = this.route.snapshot.paramMap.get('id');
    if (this.expenseId) {
      this.loadExpense(this.expenseId);
    }
  }

  createForm() {
    this.expenseForm = this.fb.group({
      date: [new Date().toISOString(), Validators.required],
      category_id: ['', Validators.required], // Matches backend requirement
      transaction_type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
    });
  }

  // --- 1. Load & Format Categories from DB ---
  loadCategories() {
    this.expService.getCategories().subscribe({
      next: (res: any) => {
        // Handle API response (adjust 'res.data' if your API wraps the array)
        const rawData = Array.isArray(res) ? res : res.data;
        this.categories = this.formatCategoryList(rawData);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.showToast('Could not load categories', 'warning');
      }
    });
  }

  // Logic to turn "Groceries" (id:2, parent:1) into "Food & Drinks › Groceries"
  formatCategoryList(data: any[]): any[] {
    if (!data) return [];

    // Create a Map for fast parent lookup (ID -> Name)
    const categoryMap = new Map();
    data.forEach(cat => categoryMap.set(cat.id, cat.name));

    return data.map(cat => {
      let displayName = cat.name;
      
      // If it has a parent, prepend the Parent Name
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parentName = categoryMap.get(cat.parent_id);
        displayName = `${parentName} › ${cat.name}`;
      }

      return {
        id: cat.id,
        displayName: displayName
      };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName)); // Sort alphabetically
  }

  // --- 2. Load Existing Expense (For Edit Mode) ---
  async loadExpense(id: string) {
    this.expService.getExpenseById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.expenseForm.patchValue({
            ...response.data,
            // Ensure date is valid ISO string for ion-datetime
            date: response.data.date || new Date().toISOString()
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  onDateChange(event: any) {
    this.expenseForm.patchValue({
      date: event.detail.value
    });
  }

  // --- 3. Save Logic ---
  saveExpense() {
    if (this.expenseForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    const payload = this.expenseForm.value;

    // Send to Backend
    const request = this.expenseId 
      ? this.expService.updateExpense(this.expenseId, payload)
      : this.expService.createExpense(payload);

    request.subscribe({
      next: () => {
        this.showToast('Transaction saved successfully', 'success');
        this.navCtrl.navigateBack('/single-view-expenses');
      },
      error: (err) => {
        console.error('Save Error:', err);
        // Show exact error from backend if available (e.g., validation error)
        const msg = err.error?.message || 'Failed to save transaction';
        this.showToast(msg, 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, position: 'top', color
    });
    await toast.present();
  }
}