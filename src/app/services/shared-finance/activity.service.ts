import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedActivityModel } from 'src/app/models/shared-finance/activity.model';

@Injectable({ providedIn: 'root' })
export class SharedActivityStateService {
  private activitySubject = new BehaviorSubject<SharedActivityModel[]>([
    {
      id: 1,
      type: 'expense_added',
      title: 'Dinner split added',
      description: 'Aisha added Barbeque Nation to Weekend Crew.',
      amount: 3480,
      actorName: 'Aisha Rao',
      groupName: 'Weekend Crew',
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 2,
      type: 'settlement_completed',
      title: 'Settlement completed',
      description: 'You settled rent with Apartment 4B.',
      amount: 850,
      actorName: 'You',
      groupName: 'Apartment 4B',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      type: 'user_joined',
      title: 'New member joined',
      description: 'Neha joined Goa Trip.',
      actorName: 'Neha Shah',
      groupName: 'Goa Trip',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  getActivity(): Observable<SharedActivityModel[]> {
    return this.activitySubject.asObservable();
  }
}
