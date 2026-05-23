import { Component, Input } from '@angular/core';
import { SharedActivityModel } from 'src/app/models/shared-finance/activity.model';

@Component({
  selector: 'app-activity-feed-card',
  template: `
    <article class="activity-card">
      <div class="activity-icon">
        <ion-icon [name]="iconName"></ion-icon>
      </div>
      <div>
        <h2>{{ activity.title }}</h2>
        <p>{{ activity.description }}</p>
        <span>{{ activity.createdAt | date:'medium' }}</span>
      </div>
      <strong *ngIf="activity.amount">₹{{ activity.amount | number:'1.0-0' }}</strong>
    </article>
  `,
  styles: [`
    .activity-card {
      display: grid;
      grid-template-columns: 42px 1fr auto;
      gap: 12px;
      align-items: start;
      padding: 14px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      margin-bottom: 10px;
    }
    .activity-icon {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      color: #2563eb;
      background: #eff6ff;
    }
    h2 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 900;
      color: #334155;
    }
    p,
    span {
      margin: 0;
      color: #64748b;
      font-size: 12px;
    }
    strong {
      color: #334155;
      font-size: 13px;
    }
  `]
})
export class ActivityFeedCardComponent {
  @Input() activity!: SharedActivityModel;

  get iconName(): string {
    switch (this.activity?.type) {
      case 'settlement_completed':
        return 'checkmark-done-outline';
      case 'user_joined':
        return 'person-add-outline';
      case 'group_updated':
        return 'settings-outline';
      default:
        return 'receipt-outline';
    }
  }
}
