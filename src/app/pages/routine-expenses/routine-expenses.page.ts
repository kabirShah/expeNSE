import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { CategoryService } from 'src/app/services/category.service';
import { RoutineExpense, RoutineExpenseService } from 'src/app/services/routine-expense.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { Wallet, WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-routine-expenses',
  templateUrl: './routine-expenses.page.html',
  styleUrls: ['./routine-expenses.page.scss'],
})
export class RoutineExpensesPage implements OnInit {
  routineForm!: FormGroup;
  routines: RoutineExpense[] = [];
  categories: any[] = [];
  wallets: Wallet[] = [];
  isLoading = false;
  isSubmitting = false;
  submitAttempted = false;
  editingRoutine: RoutineExpense | null = null;
  frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private routineService: RoutineExpenseService,
    private categoryService: CategoryService,
    private walletService: WalletService,
    private uiToast: UiToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadLookups();
    this.loadRoutines();
  }

  buildForm(): void {
    this.routineForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      category_id: [null, Validators.required],
      wallet_id: [null, Validators.required],
      frequency: ['monthly', Validators.required],
      start_date: [this.today(), Validators.required],
      end_date: [null],
      reminder: [false],
      notes: ['', Validators.maxLength(1000)]
    });
  }

  loadLookups(): void {
    this.categoryService.getCategories().subscribe({
      next: (res: any) => this.categories = res?.data || res || [],
      error: () => this.showToast('Could not load categories', 'warning')
    });

    this.walletService.getWallets().subscribe({
      next: (res) => this.wallets = res?.data || [],
      error: () => this.showToast('Could not load wallets', 'warning')
    });
  }

  loadRoutines(): void {
    this.isLoading = true;
    this.routineService.getRoutineExpenses().subscribe({
      next: (res) => this.routines = res?.data || [],
      error: () => this.showToast('Could not load routines', 'danger'),
      complete: () => this.isLoading = false
    });
  }

  saveRoutine(): void {
    if (this.routineForm.invalid) {
      this.submitAttempted = true;
      this.routineForm.markAllAsTouched();
      this.showToast('Please complete the highlighted fields', 'danger');
      return;
    }

    const payload = this.normalizePayload();
    this.isSubmitting = true;
    const request = this.editingRoutine?.id
      ? this.routineService.updateRoutineExpense(this.editingRoutine.id, payload)
      : this.routineService.createRoutineExpense(payload as RoutineExpense);

    request.subscribe({
      next: () => {
        this.showToast(this.editingRoutine ? 'Routine updated' : 'Routine created', 'success');
        this.resetForm();
        this.loadRoutines();
      },
      error: () => this.showToast('Routine could not be saved', 'danger'),
      complete: () => this.isSubmitting = false
    });
  }

  editRoutine(routine: RoutineExpense): void {
    this.editingRoutine = routine;
    this.submitAttempted = false;
    this.routineForm.patchValue({
      title: routine.title,
      amount: Number(routine.amount),
      category_id: routine.category_id,
      wallet_id: routine.wallet_id,
      frequency: routine.frequency,
      start_date: this.toDateOnly(routine.start_date),
      end_date: routine.end_date ? this.toDateOnly(routine.end_date) : null,
      reminder: !!routine.reminder,
      notes: routine.notes || ''
    });
  }

  async deleteRoutine(routine: RoutineExpense): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete routine?',
      message: routine.title,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (!routine.id) return;
            this.routineService.deleteRoutineExpense(routine.id).subscribe({
              next: () => {
                this.showToast('Routine deleted', 'success');
                this.loadRoutines();
                if (this.editingRoutine?.id === routine.id) {
                  this.resetForm();
                }
              },
              error: () => this.showToast('Routine could not be deleted', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  toggleRoutine(routine: RoutineExpense): void {
    if (!routine.id) return;
    this.routineService.toggleRoutineExpense(routine.id).subscribe({
      next: () => this.loadRoutines(),
      error: () => this.showToast('Status could not be changed', 'danger')
    });
  }

  resetForm(): void {
    this.editingRoutine = null;
    this.submitAttempted = false;
    this.routineForm.reset({
      title: '',
      amount: null,
      category_id: null,
      wallet_id: null,
      frequency: 'monthly',
      start_date: this.today(),
      end_date: null,
      reminder: false,
      notes: ''
    });
  }

  shouldShowError(field: string): boolean {
    const control = this.routineForm.get(field);
    return !!control && control.invalid && (control.touched || this.submitAttempted);
  }

  trackByRoutineId(_: number, routine: RoutineExpense): number {
    return Number(routine.id || 0);
  }

  private normalizePayload(): Partial<RoutineExpense> {
    const value = this.routineForm.value;
    return {
      ...value,
      amount: Number(value.amount),
      start_date: this.toDateOnly(value.start_date),
      end_date: value.end_date ? this.toDateOnly(value.end_date) : null,
      notes: String(value.notes || '').trim() || null,
    };
  }

  private today(): string {
    return this.toDateOnly(new Date());
  }

  private toDateOnly(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    await this.uiToast.show(message, color);
  }
}
