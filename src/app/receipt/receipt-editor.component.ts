// receipt-editor.component.ts

import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Receipt, ReceiptEditForm, ReceiptItem } from './models/receipt.model';
import { ReceiptService } from '../services/receipt.service';

/**
 * Reusable receipt edit form component.
 * Used by both receipt-review and receipt-edit pages.
 *
 * Usage:
 *   <app-receipt-editor
 *     [receipt]="receipt"
 *     (formReady)="onFormReady($event)"
 *     (saved)="onSaved($event)">
 *   </app-receipt-editor>
 */
@Component({
  selector: 'app-receipt-editor',
  templateUrl: './receipt-editor.component.html',
  styleUrls:  ['./receipt-editor.component.scss'],
})
export class ReceiptEditorComponent implements OnInit, OnChanges {
  @Input() receipt!: Receipt;
  @Input() compact  = false;   // compact mode hides some fields

  @Output() formReady = new EventEmitter<FormGroup>();
  @Output() saved     = new EventEmitter<Receipt>();
  @Output() totalsChanged = new EventEmitter<{ subtotal: number; tax: number; discount: number; total: number }>();

  form!: FormGroup;

  readonly receiptTypes = [
    { value: 'grocery',     label: '🛒 Grocery'     },
    { value: 'restaurant',  label: '🍽️ Restaurant'  },
    { value: 'fuel',        label: '⛽ Fuel'         },
    { value: 'pharmacy',    label: '💊 Pharmacy'     },
    { value: 'utility',     label: '⚡ Utility'      },
    { value: 'shopping',    label: '🛍️ Shopping'     },
    { value: 'transport',   label: '🚌 Transport'    },
    { value: 'general',     label: '📄 General'      },
  ];

  readonly paymentMethods = [
    { value: 'cash',       label: 'Cash'        },
    { value: 'upi',        label: 'UPI / GPay'  },
    { value: 'card',       label: 'Credit/Debit Card' },
    { value: 'netbanking', label: 'Net Banking'  },
  ];

  constructor(private fb: FormBuilder, private receiptService: ReceiptService) {}

  ngOnInit(): void { this.buildForm(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receipt'] && !changes['receipt'].firstChange && this.form) {
      this.patchForm();
    }
  }

  // ─── Build ────────────────────────────────────────────────────────────

  buildForm(): void {
    const r = this.receipt;

    this.form = this.fb.group({
      merchant:         [r?.merchant ?? '',         Validators.required],
      receipt_date:     [r?.receipt_date ?? ''],
      receipt_type:     [r?.receipt_type ?? 'general'],
      currency:         [r?.currency ?? 'INR'],
      payment_method:   [r?.payment_method ?? ''],
      reference_number: [r?.reference_number ?? ''],
      expense_title:    [r?.expense_title ?? r?.merchant ?? ''],
      notes:            [r?.notes ?? ''],
      subtotal:         [r?.subtotal ?? 0],
      discount:         [r?.discount ?? 0],
      tax:              [r?.tax ?? 0],
      total:            [r?.total ?? 0, [Validators.required, Validators.min(0.01)]],
      category_id:      [r?.category?.id ?? null],
      account_id:       [r?.account?.id ?? null],
      items:            this.fb.array((r?.items ?? []).map(i => this.itemGroup(i))),
    });

    // Recalculate when items change
    this.itemsArray.valueChanges.subscribe(() => {
      const totals = this.receiptService.recalculateTotals(this.itemsArray.getRawValue());
      this.form.patchValue(totals, { emitEvent: false });
      this.totalsChanged.emit(totals);
    });

    this.formReady.emit(this.form);
  }

  patchForm(): void {
    const r = this.receipt;
    this.form.patchValue({
      merchant: r.merchant, receipt_date: r.receipt_date,
      receipt_type: r.receipt_type, currency: r.currency,
      payment_method: r.payment_method, reference_number: r.reference_number,
      expense_title: r.expense_title, notes: r.notes,
      subtotal: r.subtotal, discount: r.discount, tax: r.tax, total: r.total,
    }, { emitEvent: false });

    // Rebuild items array
    this.itemsArray.clear({ emitEvent: false });
    (r.items ?? []).forEach(i => this.itemsArray.push(this.itemGroup(i)));
  }

  // ─── Items ────────────────────────────────────────────────────────────

  itemGroup(item?: Partial<ReceiptItem>): FormGroup {
    return this.fb.group({
      id:         [item?.id ?? null],
      name:       [item?.name ?? '',  Validators.required],
      qty:        [item?.qty ?? 1,    [Validators.required, Validators.min(0.001)]],
      unit:       [item?.unit ?? ''],
      unit_price: [item?.unit_price ?? 0, Validators.min(0)],
      discount:   [item?.discount ?? 0],
      tax_rate:   [item?.tax_rate ?? 0],
      tax:        [{ value: item?.tax ?? 0,   disabled: true }],
      total:      [{ value: item?.total ?? 0, disabled: true }],
      confidence: [item?.confidence ?? 100],
    });
  }

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  addItem():                 void { this.itemsArray.push(this.itemGroup()); }
  removeItem(i: number):     void { this.itemsArray.removeAt(i); }
  duplicateItem(i: number):  void {
    const v = { ...this.itemsArray.at(i).getRawValue(), id: null };
    this.itemsArray.insert(i + 1, this.itemGroup(v));
  }

  onItemChange(i: number): void {
    const g = this.itemsArray.at(i) as FormGroup;
    const { tax, total } = this.receiptService.recalculateItem(g.getRawValue());
    g.patchValue({ tax, total }, { emitEvent: false });
    const totals = this.receiptService.recalculateTotals(this.itemsArray.getRawValue());
    this.form.patchValue(totals, { emitEvent: false });
    this.totalsChanged.emit(totals);
  }

  // ─── Public API (called by parent page) ──────────────────────────────

  getValue(): Partial<ReceiptEditForm> {
    return {
      ...this.form.value,
      total: this.form.getRawValue().total,
      items: this.itemsArray.getRawValue(),
    };
  }

  isValid(): boolean { return this.form.valid; }
  markTouched(): void { this.form.markAllAsTouched(); }

  getFieldStatus(field: string): string {
    return this.receipt?.field_status?.[field] ?? 'auto';
  }

  isLowConf(field: string): boolean {
    const s = this.getFieldStatus(field);
    return s === 'low_confidence' || s === 'missing';
  }
}
