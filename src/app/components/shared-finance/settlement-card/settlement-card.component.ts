import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettlementModel } from 'src/app/models/shared-finance/settlement.model';

@Component({
  selector: 'app-settlement-card',
  template: `
    <ion-item lines="none" class="settlement-card">
      <ion-icon name="swap-horizontal-outline" slot="start"></ion-icon>
      <ion-label>
        <h2>{{ settlement.fromName }} → {{ settlement.toName }}</h2>
        <p>{{ settlement.groupName || 'Personal' }} · {{ settlement.status | titlecase }}</p>
      </ion-label>
      <ion-note slot="end">₹{{ settlement.amount | number:'1.0-0' }}</ion-note>
      <ion-button *ngIf="settlement.status === 'pending'" size="small" fill="outline" (click)="complete.emit(settlement)">
        Settle
      </ion-button>
    </ion-item>
  `,
  styles: [`
    .settlement-card {
      --background: #ffffff;
      --border-radius: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      margin-bottom: 10px;
    }
    ion-icon {
      color: #2563eb;
    }
    h2 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 800;
      color: #334155;
    }
    p {
      color: #64748b;
      font-size: 12px;
    }
    ion-note {
      color: #334155;
      font-weight: 900;
    }
  `]
})
export class SettlementCardComponent {
  @Input() settlement!: SettlementModel;
  @Output() complete = new EventEmitter<SettlementModel>();
}
