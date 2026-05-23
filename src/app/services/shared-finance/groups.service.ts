import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedGroupModel } from 'src/app/models/shared-finance/group.model';

@Injectable({ providedIn: 'root' })
export class SharedGroupsStateService {
  private groupsSubject = new BehaviorSubject<SharedGroupModel[]>([
    {
      id: 1,
      name: 'Apartment 4B',
      type: 'home',
      memberCount: 4,
      totalSpend: 58200,
      balance: 2450,
      updatedAt: new Date().toISOString(),
      color: '#2563eb'
    },
    {
      id: 2,
      name: 'Goa Trip',
      type: 'trip',
      memberCount: 6,
      totalSpend: 37600,
      balance: -1280,
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      color: '#10b981'
    },
    {
      id: 3,
      name: 'Office Lunch',
      type: 'office',
      memberCount: 8,
      totalSpend: 9200,
      balance: 0,
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      color: '#f59e0b'
    }
  ]);

  getGroups(): Observable<SharedGroupModel[]> {
    return this.groupsSubject.asObservable();
  }
}
