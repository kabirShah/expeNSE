import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { SharedFinanceService } from './shared-finance.service';

export type SharedQueueOperation = 'create_group_expense' | 'create_settlement' | 'comment' | 'sync_contacts';

export interface SharedQueueItem {
  id: string;
  operation: SharedQueueOperation;
  payload: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedOfflineQueueService {
  private readonly key = 'shared_finance_queue';
  private storageReady?: Promise<void>;

  constructor(
    private storage: Storage,
    private sharedFinance: SharedFinanceService
  ) {}

  async enqueue(operation: SharedQueueOperation, payload: any): Promise<SharedQueueItem> {
    await this.ensureStorage();
    const queue = await this.getQueue();
    const item: SharedQueueItem = {
      id: crypto.randomUUID(),
      operation,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    queue.push(item);
    await this.storage.set(this.key, queue);

    return item;
  }

  async getQueue(): Promise<SharedQueueItem[]> {
    await this.ensureStorage();
    return (await this.storage.get(this.key)) || [];
  }

  async flush(): Promise<void> {
    if (!navigator.onLine) {
      return;
    }

    await this.ensureStorage();
    const queue = await this.getQueue();
    const remaining: SharedQueueItem[] = [];

    for (const item of queue) {
      try {
        await this.dispatch(item);
      } catch (error: any) {
        remaining.push({
          ...item,
          retryCount: item.retryCount + 1,
          lastError: error?.message || 'Sync failed'
        });
      }
    }

    await this.storage.set(this.key, remaining);
  }

  private async dispatch(item: SharedQueueItem): Promise<void> {
    if (item.operation === 'create_group_expense') {
      await firstValueFrom(this.sharedFinance.addGroupExpense(item.payload.group_id, item.payload));
      return;
    }

    if (item.operation === 'comment') {
      await firstValueFrom(this.sharedFinance.addExpenseComment(item.payload.expense_id, item.payload));
      return;
    }

    if (item.operation === 'sync_contacts') {
      await firstValueFrom(this.sharedFinance.syncContacts(item.payload.contacts || []));
    }
  }

  private async ensureStorage(): Promise<void> {
    this.storageReady = this.storageReady || this.storage.create().then(() => undefined);
    await this.storageReady;
  }
}
