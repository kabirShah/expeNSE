import { Component, Input } from '@angular/core';
import { SharedGroupModel } from 'src/app/models/shared-finance/group.model';

@Component({
  selector: 'app-shared-group-card',
  template: `
    <article class="group-card">
      <div class="group-top">
        <div class="group-avatar" [style.background]="group.color">{{ group.name.charAt(0) }}</div>
        <ion-chip>{{ group.type | titlecase }}</ion-chip>
      </div>
      <h2>{{ group.name }}</h2>
      <p>{{ group.memberCount }} members · updated {{ group.updatedAt | date:'dd MMM' }}</p>
      <div class="group-bottom">
        <span>Total ₹{{ group.totalSpend | number:'1.0-0' }}</span>
        <strong [class.negative]="group.balance < 0">
          {{ group.balance >= 0 ? 'Gets' : 'Owes' }} ₹{{ absBalance | number:'1.0-0' }}
        </strong>
      </div>
    </article>
  `,
  styles: [`
    .group-card {
      min-width: 230px;
      padding: 16px;
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    }
    .group-top,
    .group-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .group-avatar {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      color: #ffffff;
      font-weight: 900;
    }
    h2 {
      margin: 14px 0 4px;
      font-size: 17px;
      font-weight: 900;
      color: #334155;
    }
    p,
    span {
      color: #64748b;
      font-size: 12px;
    }
    strong {
      color: #10b981;
      font-size: 13px;
    }
    strong.negative {
      color: #ef4444;
    }
  `]
})
export class GroupCardComponent {
  @Input() group!: SharedGroupModel;

  get absBalance(): number {
    return Math.abs(this.group?.balance || 0);
  }
}
