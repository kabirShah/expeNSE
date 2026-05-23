import { Component, Input } from '@angular/core';
import { ExpenseSplitModel } from 'src/app/models/shared-finance/expense-split.model';

@Component({
  selector: 'app-expense-split-card',
  template: `
    <article class="split-card">
      <div class="split-top">
        <div>
          <span>{{ split.mode | titlecase }} split</span>
          <h2>₹{{ split.amount | number:'1.2-2' }}</h2>
        </div>
        <ion-badge [color]="split.isBalanced ? 'success' : 'warning'">
          {{ split.isBalanced ? 'Balanced' : 'Check totals' }}
        </ion-badge>
      </div>
      <div class="split-row" *ngFor="let participant of split.participants">
        <span>{{ participant.name }}</span>
        <strong>₹{{ participant.calculatedAmount | number:'1.2-2' }}</strong>
      </div>
      <p *ngIf="!split.isBalanced">Remaining ₹{{ split.remainingAmount | number:'1.2-2' }}</p>
    </article>
  `,
  styles: [`
    .split-card {
      padding: 14px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .split-top,
    .split-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .split-top {
      margin-bottom: 12px;
    }
    span {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }
    h2 {
      margin: 5px 0 0;
      color: #334155;
      font-size: 22px;
      font-weight: 900;
    }
    .split-row {
      padding: 9px 0;
      border-top: 1px solid #f1f5f9;
    }
    strong {
      color: #334155;
      font-size: 13px;
    }
    p {
      margin: 8px 0 0;
      color: #f59e0b;
      font-size: 12px;
      font-weight: 800;
    }
  `]
})
export class ExpenseSplitCardComponent {
  @Input() split!: ExpenseSplitModel;
}
