import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedFriendModel } from 'src/app/models/shared-finance/friend.model';

@Component({
  selector: 'app-shared-friend-card',
  template: `
    <ion-item lines="none" class="friend-card">
      <ion-avatar slot="start">
        <span>{{ initials }}</span>
      </ion-avatar>
      <ion-label>
        <h2>{{ friend.name }}</h2>
        <p>{{ friend.status | titlecase }} · used {{ friend.usageCount }} times</p>
      </ion-label>
      <ion-badge [color]="friend.isRegistered ? 'success' : 'medium'">
        {{ friend.isRegistered ? 'Registered' : 'Invite' }}
      </ion-badge>
      <ion-note slot="end" [class.negative]="friend.balance < 0">
        {{ friend.balance >= 0 ? '+' : '-' }}₹{{ absBalance | number:'1.0-0' }}
      </ion-note>
      <ion-button fill="clear" (click)="favorite.emit(friend)">
        <ion-icon [name]="friend.isFavorite ? 'star' : 'star-outline'" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-item>
  `,
  styles: [`
    .friend-card {
      --background: #ffffff;
      --border-radius: 16px;
      --padding-start: 12px;
      --inner-padding-end: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      margin-bottom: 10px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
    }
    ion-avatar {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      background: #eff6ff;
      color: #2563eb;
      font-weight: 800;
    }
    h2 {
      margin: 0 0 3px;
      font-size: 15px;
      font-weight: 800;
      color: #334155;
    }
    p {
      color: #64748b;
      font-size: 12px;
    }
    ion-note {
      font-weight: 900;
      color: #10b981;
      white-space: nowrap;
    }
    ion-note.negative {
      color: #ef4444;
    }
  `]
})
export class FriendCardComponent {
  @Input() friend!: SharedFriendModel;
  @Output() favorite = new EventEmitter<SharedFriendModel>();

  get initials(): string {
    return (this.friend?.name || '?').slice(0, 1).toUpperCase();
  }

  get absBalance(): number {
    return Math.abs(this.friend?.balance || 0);
  }
}
