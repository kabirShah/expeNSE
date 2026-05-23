import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-balance-summary-card',
  template: `
    <article class="balance-card" [class.owed]="tone === 'owed'">
      <span>{{ label }}</span>
      <strong>₹{{ amount | number:'1.0-0' }}</strong>
    </article>
  `,
  styles: [`
    .balance-card {
      padding: 14px;
      border-radius: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #10b981;
    }
    .balance-card.owed {
      border-left-color: #ef4444;
    }
    span {
      display: block;
      margin-bottom: 8px;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }
    strong {
      color: #334155;
      font-size: 19px;
      font-weight: 900;
    }
  `]
})
export class BalanceSummaryCardComponent {
  @Input() label = '';
  @Input() amount = 0;
  @Input() tone: 'gets' | 'owed' | 'neutral' = 'neutral';
}
