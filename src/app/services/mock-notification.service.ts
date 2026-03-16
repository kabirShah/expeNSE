import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export type MockNotificationAction = 'created' | 'updated' | 'deleted' | 'info';

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  entity: 'expense' | 'multi-expense' | 'balance' | 'system';
  action: MockNotificationAction;
  isRead: boolean;
  tooltip?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockNotificationService {
  private readonly storageKey = 'pm_mock_notifications_v1';
  private readonly notificationsSubject = new BehaviorSubject<MockNotification[]>([]);

  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.notifications$.pipe(
    map((items) => items.filter((item) => !item.isRead).length)
  );

  constructor() {
    this.load();

    if (!this.notificationsSubject.value.length) {
      this.add({
        title: 'Mock notifications enabled',
        message: 'CRUD notifications are currently mocked for all modules.',
        entity: 'system',
        action: 'info',
        tooltip: 'These are local notifications stored on this device for UI testing.'
      });
    }
  }

  getSnapshot(): MockNotification[] {
    return [...this.notificationsSubject.value];
  }

  addCrudNotification(
    entityLabel: 'Balance' | 'Expense' | 'Multi Expense',
    action: 'created' | 'updated' | 'deleted',
    detail?: string
  ): void {
    const entity = this.toEntity(entityLabel);
    const title = `${entityLabel} ${action}`;

    this.add({
      title,
      message: detail ? detail : `${entityLabel} was ${action}.`,
      entity,
      action,
      tooltip: `Mock event from ${entityLabel} ${action.toUpperCase()} action.`
    });
  }

  add(payload: {
    title: string;
    message: string;
    entity: MockNotification['entity'];
    action: MockNotificationAction;
    tooltip?: string;
  }): void {
    const next: MockNotification = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: payload.title,
      message: payload.message,
      entity: payload.entity,
      action: payload.action,
      tooltip: payload.tooltip,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const updated = [next, ...this.notificationsSubject.value];
    this.notificationsSubject.next(updated);
    this.persist(updated);
  }

  markAsRead(id: string): void {
    this.updateItem(id, { isRead: true });
  }

  markAsUnread(id: string): void {
    this.updateItem(id, { isRead: false });
  }

  toggleRead(id: string): void {
    const item = this.notificationsSubject.value.find((n) => n.id === id);
    if (!item) return;
    this.updateItem(id, { isRead: !item.isRead });
  }

  markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map((item) => ({
      ...item,
      isRead: true
    }));

    this.notificationsSubject.next(updated);
    this.persist(updated);
  }

  delete(id: string): void {
    const updated = this.notificationsSubject.value.filter((item) => item.id !== id);
    this.notificationsSubject.next(updated);
    this.persist(updated);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.persist([]);
  }

  private updateItem(id: string, patch: Partial<MockNotification>): void {
    const updated = this.notificationsSubject.value.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );

    this.notificationsSubject.next(updated);
    this.persist(updated);
  }

  private toEntity(label: 'Balance' | 'Expense' | 'Multi Expense'): MockNotification['entity'] {
    if (label === 'Balance') return 'balance';
    if (label === 'Multi Expense') return 'multi-expense';
    return 'expense';
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as MockNotification[];
      if (Array.isArray(parsed)) {
        this.notificationsSubject.next(parsed);
      }
    } catch (error) {
      console.warn('Failed to parse mock notifications', error);
    }
  }

  private persist(items: MockNotification[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
