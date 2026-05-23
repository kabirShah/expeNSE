import { Component, Input } from '@angular/core';
import { SharedFinanceAnalyticsModel } from 'src/app/models/shared-finance/analytics.model';

@Component({
  selector: 'app-shared-analytics-card',
  template: `
    <article class="analytics-card">
      <div class="analytics-top">
        <div>
          <span>Monthly shared spend</span>
          <h2>₹{{ analytics.monthlySpend | number:'1.0-0' }}</h2>
        </div>
        <ion-badge color="primary">{{ analytics.activeGroups }} groups</ion-badge>
      </div>
      <div class="trend-bars">
        <div *ngFor="let point of analytics.trend" class="trend-bar">
          <span [style.height.%]="heightFor(point.amount)"></span>
          <small>{{ point.label }}</small>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .analytics-card {
      padding: 16px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
    }
    .analytics-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    span {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }
    h2 {
      margin: 6px 0 0;
      color: #334155;
      font-size: 24px;
      font-weight: 900;
    }
    .trend-bars {
      height: 120px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-items: end;
      gap: 12px;
      margin-top: 18px;
    }
    .trend-bar {
      height: 100%;
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 8px;
      align-items: end;
      text-align: center;
    }
    .trend-bar span {
      width: 100%;
      min-height: 12px;
      align-self: end;
      border-radius: 999px 999px 4px 4px;
      background: linear-gradient(180deg, #2563eb, #1e3a8a);
    }
    small {
      color: #64748b;
      font-size: 10px;
    }
  `]
})
export class AnalyticsCardComponent {
  @Input() analytics!: SharedFinanceAnalyticsModel;

  heightFor(amount: number): number {
    const max = Math.max(...(this.analytics?.trend || []).map(point => point.amount), 1);
    return Math.max((amount / max) * 100, 10);
  }
}
