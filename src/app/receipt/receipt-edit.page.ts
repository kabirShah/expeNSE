// receipt-edit.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { ReceiptService } from '../services/receipt.service';
import { Receipt, ReceiptItem } from './models/receipt.model';

@Component({
  selector: 'app-receipt-edit',
  templateUrl: './receipt-edit.page.html',
  styleUrls: ['./receipt-edit.page.scss'],
})
export class ReceiptEditPage implements OnInit, OnDestroy {
  receipt: Receipt | null = null;
  form!: FormGroup;
  isLoading = true;
  isSaving  = false;
  private destroy$ = new Subject<void>();
  private draftTimer: any;

  readonly receiptTypes = [
    { value: 'grocery',     label: 'Grocery'     },
    { value: 'restaurant',  label: 'Restaurant'  },
    { value: 'fuel',        label: 'Fuel'        },
    { value: 'pharmacy',    label: 'Pharmacy'    },
    { value: 'utility',     label: 'Utility'     },
    { value: 'shopping',    label: 'Shopping'    },
    { value: 'transport',   label: 'Transport'   },
    { value: 'general',     label: 'General'     },
  ];

  readonly paymentMethods = [
    { value: 'cash',       label: 'Cash'        },
    { value: 'upi',        label: 'UPI'         },
    { value: 'card',       label: 'Card'        },
    { value: 'netbanking', label: 'Net Banking' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private receiptService: ReceiptService,
    private location: Location,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReceipt(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.draftTimer);
  }

  private loadReceipt(id: number): void {
    this.isLoading = true;
    this.receiptService.getReceipt(id).subscribe({
      next: (res) => {
        this.receipt  = res as Receipt;
        this.isLoading = false;
        this.buildForm();
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Could not load receipt', 'danger');
        this.router.navigate(['/receipt/list']);
      },
    });
  }

  // ─── Form ─────────────────────────────────────────────────────────────

  buildForm(): void {
    const r = this.receipt!;
    this.form = this.fb.group({
      merchant:         [r.merchant ?? '',         Validators.required],
      receipt_date:     [r.receipt_date ?? ''],
      receipt_type:     [r.receipt_type ?? 'general'],
      currency:         [r.currency ?? 'INR'],
      payment_method:   [r.payment_method ?? ''],
      reference_number: [r.reference_number ?? ''],
      expense_title:    [r.expense_title ?? r.merchant ?? ''],
      notes:            [r.notes ?? ''],
      subtotal:         [r.subtotal ?? 0],
      discount:         [r.discount ?? 0],
      tax:              [r.tax ?? 0],
      total:            [r.total ?? 0, [Validators.required, Validators.min(0.01)]],
      category_id:      [r.category?.id ?? null],
      account_id:       [r.account?.id ?? null],
      items: this.fb.array((r.items ?? []).map(i => this.itemGroup(i))),
    });

    // Auto-save draft
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      clearTimeout(this.draftTimer);
      this.draftTimer = setTimeout(() => this.receiptService.saveDraft(r.id, this.form.value), 5000);
    });

    // Recalculate on item changes
    this.itemsArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.recalcTotals();
    });
  }

  itemGroup(item?: Partial<ReceiptItem>): FormGroup {
    return this.fb.group({
      id:         [item?.id ?? null],
      name:       [item?.name ?? '',  Validators.required],
      qty:        [item?.qty ?? 1,    [Validators.required, Validators.min(0.001)]],
      unit:       [item?.unit ?? ''],
      unit_price: [item?.unit_price ?? 0, [Validators.required, Validators.min(0)]],
      discount:   [item?.discount ?? 0],
      tax_rate:   [item?.tax_rate ?? 0,   [Validators.min(0), Validators.max(100)]],
      tax:        [{ value: item?.tax ?? 0,   disabled: true }],
      total:      [{ value: item?.total ?? 0, disabled: true }],
    });
  }

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  addItem(): void    { this.itemsArray.push(this.itemGroup()); }
  removeItem(i: number): void { this.itemsArray.removeAt(i); this.recalcTotals(); }

  onItemChange(i: number): void {
    const g    = this.itemsArray.at(i) as FormGroup;
    const v    = g.getRawValue();
    const { tax, total } = this.receiptService.recalculateItem(v);
    g.patchValue({ tax, total }, { emitEvent: false });
    this.recalcTotals();
  }

  recalcTotals(): void {
    const { subtotal, tax, discount, total } = this.receiptService.recalculateTotals(
      this.itemsArray.getRawValue()
    );
    this.form.patchValue({ subtotal, tax, discount, total }, { emitEvent: false });
  }

  // ─── Save ─────────────────────────────────────────────────────────────

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;

    const payload = { ...this.form.value, total: this.form.getRawValue().total, items: this.itemsArray.getRawValue() };

    this.receiptService.updateReceipt(this.receipt!.id, payload).subscribe({
      next: async (res) => {
        this.receipt  = res.data ?? this.receipt;
        this.isSaving = false;
        if (this.receipt?.id) {
          await this.receiptService.clearDraft(this.receipt.id);
          this.showToast('Receipt saved!', 'success');
          this.router.navigate(['/receipt/details', this.receipt.id]);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(err.error?.message ?? 'Save failed', 'danger');
      },
    });
  }

  async discard(): Promise<void> {
    if (this.form.dirty) {
      const alert = await this.alertCtrl.create({
        header: 'Discard changes?',
        buttons: [
          { text: 'Keep editing', role: 'cancel' },
          { text: 'Discard', role: 'destructive', handler: () => this.location.back() },
        ],
      });
      await alert.present();
    } else {
      this.router.navigate(['/receipt-details', this.receipt!.id]);
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 2500, color, position: 'bottom' });
    await t.present();
  }
}
