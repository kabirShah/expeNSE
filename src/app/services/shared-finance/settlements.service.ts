import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SettlementModel } from 'src/app/models/shared-finance/settlement.model';

@Injectable({ providedIn: 'root' })
export class SharedSettlementsStateService {
  private settlementsSubject = new BehaviorSubject<SettlementModel[]>([
    {
      id: 1,
      fromName: 'Karan Mehta',
      toName: 'You',
      amount: 620,
      status: 'pending',
      groupName: 'Goa Trip',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      fromName: 'You',
      toName: 'Aisha Rao',
      amount: 850,
      status: 'completed',
      groupName: 'Apartment 4B',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      completedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  getSettlements(): Observable<SettlementModel[]> {
    return this.settlementsSubject.asObservable();
  }

  markCompleted(id: number): Observable<SettlementModel | null> {
    let completed: SettlementModel | null = null;
    const settlements = this.settlementsSubject.value.map(settlement => {
      if (settlement.id !== id) {
        return settlement;
      }
      completed = { ...settlement, status: 'completed', completedAt: new Date().toISOString() };
      return completed;
    });
    this.settlementsSubject.next(settlements);
    return of(completed).pipe(delay(120));
  }
}
