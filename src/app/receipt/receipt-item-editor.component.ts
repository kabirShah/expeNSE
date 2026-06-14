import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ReceiptItem } from './models/receipt.model';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-receipt-item-editor',
  template: `
<div class="item-editor" [class.low-conf]="item.confidence < 70" [class.selected]="selected">

  <!-- Header row -->
  <div class="editor-header">
    <div class="left">
      <ion-chip [color]="confColor" outline="true" class="conf-chip">
        <ion-icon [name]="confIcon"></ion-icon>
        <ion-label>{{ item.confidence | number:'1.0-0' }}%</ion-label>
      </ion-chip>
      <span class="manual-tag" *ngIf="item.is_manual">Manual</span>
    </div>
    <div class="right">
      <ion-button fill="clear" size="small" (click)="highlight.emit(item)">
        <ion-icon name="locate-outline"></ion-icon>
      </ion-button>
      <ion-button fill="clear" size="small" (click)="duplicate.emit(item)">
        <ion-icon name="copy-outline"></ion-icon>
      </ion-button>
      <ion-button fill="clear" size="small" color="danger" (click)="remove.emit(item)">
        <ion-icon name="trash-outline"></ion-icon>
      </ion-button>
    </div>
  </div>

  <!-- Form -->
  <form [formGroup]="form" class="editor-form">

    <!-- Name -->
    <ion-item lines="inset">
      <ion-label position="stacked">Item Name</ion-label>
      <ion-input formControlName="name" placeholder="e.g. Toor Dal 500g"></ion-input>
    </ion-item>

    <!-- Qty + Unit -->
    <div class="row-2">
      <ion-item lines="inset" class="flex-item">
        <ion-label position="stacked">Qty</ion-label>
        <ion-input type="number" formControlName="qty" inputmode="decimal"></ion-input>
      </ion-item>
      <ion-item lines="inset" class="flex-item">
        <ion-label position="stacked">Unit</ion-label>
        <ion-input formControlName="unit" placeholder="kg / pcs"></ion-input>
      </ion-item>
    </div>

    <!-- Price + Discount -->
    <div class="row-2">
      <ion-item lines="inset" class="flex-item">
        <ion-label position="stacked">Unit Price</ion-label>
        <ion-input type="number" formControlName="unit_price" inputmode="decimal"></ion-input>
      </ion-item>
      <ion-item lines="inset" class="flex-item">
        <ion-label position="stacked">Discount</ion-label>
        <ion-input type="number" formControlName="discount" inputmode="decimal"></ion-input>
      </ion-item>
    </div>

    <!-- Tax % + Total -->
    <div class="row-2">
      <ion-item lines="inset" class="flex-item">
        <ion-label position="stacked">Tax %</ion-label>
        <ion-input type="number" formControlName="tax_rate" inputmode="decimal"></ion-input>
      </ion-item>
      <ion-item lines="inset" class="flex-item total-field">
        <ion-label position="stacked">Total</ion-label>
        <ion-input type="number" formControlName="total" readonly></ion-input>
      </ion-item>
    </div>

  </form>

</div>
  `,
  styles: [`
    .item-editor {
      border: 1.5px solid var(--ion-color-light-shade);
      border-radius: 12px; margin-bottom: 10px;
      overflow: hidden; background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;

      &.low-conf  { border-color: var(--ion-color-warning); }
      &.selected  { border-color: var(--ion-color-primary); box-shadow: 0 2px 12px rgba(var(--ion-color-primary-rgb),.15); }
    }

    .editor-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px 6px 12px;
      background: var(--ion-color-light);
      border-bottom: 1px solid var(--ion-color-light-shade);

      .left { display: flex; align-items: center; gap: 6px; }
      .right { display: flex; }

      .conf-chip { font-size: 11px; height: 22px; margin: 0; }
      .manual-tag {
        font-size: 10px; font-weight: 600; padding: 2px 6px;
        border-radius: 4px; background: var(--ion-color-secondary-tint);
        color: var(--ion-color-secondary);
      }

      ion-button { --padding-start: 6px; --padding-end: 6px; }
    }

    .editor-form { padding: 4px 0 8px; }

    .row-2 { display: flex; gap: 4px; .flex-item { flex: 1; } }

    .total-field {
      --background: var(--ion-color-light);
      ion-input { color: var(--ion-color-primary); font-weight: 700; }
    }
  `],
})
export class ReceiptItemEditorComponent implements OnInit, OnDestroy {
  @Input() item!: ReceiptItem;
  @Input() selected = false;

  @Output() changed   = new EventEmitter<ReceiptItem>();
  @Output() remove    = new EventEmitter<ReceiptItem>();
  @Output() duplicate = new EventEmitter<ReceiptItem>();
  @Output() highlight = new EventEmitter<ReceiptItem>();

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private receiptService: ReceiptService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:       [this.item.name,       Validators.required],
      qty:        [this.item.qty,        [Validators.required, Validators.min(0.001)]],
      unit:       [this.item.unit ?? ''],
      unit_price: [this.item.unit_price, [Validators.required, Validators.min(0)]],
      discount:   [this.item.discount ?? 0],
      tax_rate:   [this.item.tax_rate ?? 0, [Validators.min(0), Validators.max(100)]],
      tax:        [{ value: this.item.tax ?? 0,   disabled: true }],
      total:      [{ value: this.item.total ?? 0, disabled: true }],
    });

    // Recalculate on financial field changes
    ['qty', 'unit_price', 'discount', 'tax_rate'].forEach(field => {
      this.form.get(field)?.valueChanges
        .pipe(debounceTime(300), takeUntil(this.destroy$))
        .subscribe(() => this.recalc());
    });

    // Emit full item on any change
    this.form.valueChanges
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.valid) {
          this.changed.emit({ ...this.item, ...this.form.getRawValue() });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private recalc(): void {
    const { tax, total } = this.receiptService.recalculateItem(this.form.getRawValue());
    this.form.patchValue({ tax, total }, { emitEvent: false });
  }

  get confColor(): string {
    const c = this.item.confidence;
    return c >= 85 ? 'success' : c >= 65 ? 'warning' : 'danger';
  }

  get confIcon(): string {
    const c = this.item.confidence;
    return c >= 85 ? 'checkmark-circle-outline' : 'warning-outline';
  }
}
