import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedFinanceAnalyticsModel } from 'src/app/models/shared-finance/analytics.model';
import { SharedFriendsStateService } from './friends.service';
import { SharedGroupsStateService } from './groups.service';

@Injectable({ providedIn: 'root' })
export class SharedAnalyticsStateService {
  constructor(
    private friendsState: SharedFriendsStateService,
    private groupsState: SharedGroupsStateService
  ) {}

  getAnalytics(): Observable<SharedFinanceAnalyticsModel> {
    return combineLatest([
      this.friendsState.getFriends(),
      this.groupsState.getGroups()
    ]).pipe(
      map(([friends, groups]) => {
        const balances = [...friends.map(friend => friend.balance), ...groups.map(group => group.balance)];
        const totalReceivable = balances.filter(balance => balance > 0).reduce((sum, balance) => sum + balance, 0);
        const totalOwed = Math.abs(balances.filter(balance => balance < 0).reduce((sum, balance) => sum + balance, 0));
        const groupTotal = groups.reduce((sum, group) => sum + group.totalSpend, 0);
        const friendTotal = friends.reduce((sum, friend) => sum + Math.abs(friend.balance), 0);

        return {
          netBalance: totalReceivable - totalOwed,
          totalReceivable,
          totalOwed,
          monthlySpend: groupTotal,
          groupTotal,
          friendTotal,
          activeGroups: groups.length,
          trend: [
            { label: 'Week 1', amount: 8200 },
            { label: 'Week 2', amount: 12600 },
            { label: 'Week 3', amount: 9400 },
            { label: 'Week 4', amount: 15800 }
          ]
        };
      })
    );
  }
}
