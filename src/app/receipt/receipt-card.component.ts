// receipt-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReceiptListItem } from './models/receipt.model';

@Component({
  selector: 'app-receipt-card',
  template: `
<ion-card
  class="receipt-card"
  [class.card-review]="receipt.requires_review"
  [class.card-saved]="receipt.status === 'saved'"
  (click)="cardClick.emit(receipt)">

  <ion-card-content>
    <div class="card-inner">

      <div class="type-pill" [attr.data-type]="receipt.receipt_type">
        <ion-icon [name]="typeIcon"></ion-icon>
      </div>

      <div class="info">
        <div class="top">
          <span class="merchant">{{ receipt.merchant || 'Unknown' }}</span>
          <span class="amount">{{ formatAmount(receipt.total, receipt.currency) }}</span>
        </div>
        <div class="bottom">
          <span class="date">{{ formatDate(receipt.receipt_date) }}</span>
          <ion-badge [color]="statusColor" class="sbadge">{{ receipt.status | titlecase }}</ion-badge>
          <ion-badge color="success" *ngIf="receipt.expense_id">✓ Expense</ion-badge>
        </div>
        <div class="conf-bar" *ngIf="showConfidence">
          <div class="conf-fill" [style.width.%]="receipt.ocr_confidence ?? 0" [class.low]="(receipt.ocr_confidence ?? 0) < 80"></div>
        </div>
      </div>

    </div>
  </ion-card-content>
</ion-card>
  `,
  styles: [`
    .receipt-card {
      margin: 4px 0;
      border-radius: 14px;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;

      &:active { transform: scale(0.97); }
      &.card-review { border-left: 3px solid var(--ion-color-warning); }
      &.card-saved  { border-left: 3px solid var(--ion-color-success); }

      ion-card-content { padding: 12px 14px; }
    }

    .card-inner { display: flex; gap: 12px; align-items: center; }

    .type-pill {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      ion-icon { font-size: 22px; }

      &[data-type="grocery"]    { background: #e8f5e9; color: #388e3c; }
      &[data-type="restaurant"] { background: #fff3e0; color: #e65100; }
      &[data-type="fuel"]       { background: #fce4ec; color: #c62828; }
      &[data-type="pharmacy"]   { background: #e3f2fd; color: #1565c0; }
      &[data-type="utility"]    { background: #fffde7; color: #f57f17; }
      &[data-type="shopping"]   { background: #f3e5f5; color: #7b1fa2; }
      &[data-type="general"]    { background: var(--ion-color-light); color: var(--ion-color-medium); }
    }

    .info { flex: 1; min-width: 0; }

    .top {
      display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
      .merchant { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
      .amount   { font-size: 15px; font-weight: 700; color: var(--ion-color-primary); flex-shrink: 0; }
    }

    .bottom {
      display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;
      .date   { font-size: 12px; color: var(--ion-color-medium); }
      .sbadge { font-size: 10px; height: 18px; }
      ion-badge { font-size: 10px; height: 18px; }
    }

    .conf-bar {
      height: 3px; background: var(--ion-color-light); border-radius: 2px; margin-top: 6px;
      .conf-fill {
        height: 100%; border-radius: 2px;
        background: var(--ion-color-success);
        transition: width 0.3s;
        &.low { background: var(--ion-color-warning); }
      }
    }
  `],
})
export class ReceiptCardComponent {
  @Input() receipt!: ReceiptListItem;
  @Input() showConfidence = true;
  @Output() cardClick = new EventEmitter<ReceiptListItem>();

  get typeIcon(): string {
    const map: Record<string, string> = {
      grocery: 'basket', restaurant: 'restaurant', fuel: 'car',
      pharmacy: 'medical', utility: 'flash', shopping: 'bag',
      mall: 'business', transport: 'bus', entertainment: 'game-controller',
    };
    const key = this.receipt?.receipt_type ?? '';
    return (map[key] ?? 'receipt') + '-outline';
  }

  get statusColor(): string {
    const map: Record<string, string> = {
      draft: 'medium', processing: 'primary', review: 'warning',
      confirmed: 'secondary', saved: 'success', failed: 'danger',
    };
    return map[this.receipt.status] ?? 'medium';
  }

  formatAmount(amount?: number, currency = 'INR'): string {
    if (amount === undefined || amount === null) return `${currency} 0.00`;
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount); }
    catch { return `${currency} ${Number(amount).toFixed(2)}`; }
  }

  formatDate(d?: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
