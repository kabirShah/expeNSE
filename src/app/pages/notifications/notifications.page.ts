import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MockNotification, MockNotificationService } from 'src/app/services/mock-notification.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

type NotificationFilter = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {
  notifications: MockNotification[] = [];
  filteredNotifications: MockNotification[] = [];
  activeFilter: NotificationFilter = 'all';
  unreadCount = 0;

  private notificationSub?: Subscription;
  private unreadSub?: Subscription;

  constructor(
    private navCtrl: NavController,
    private uiToast: UiToastService,
    private mockNotificationService: MockNotificationService
  ) {}

  ngOnInit(): void {
    this.notificationSub = this.mockNotificationService.notifications$.subscribe((items) => {
      this.notifications = items;
      this.applyFilter();
    });

    this.unreadSub = this.mockNotificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  goBack(): void {
    this.navCtrl.back();
  }

  setFilter(filter: NotificationFilter): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  markAsRead(id: string): void {
    this.mockNotificationService.markAsRead(id);
  }

  markAsUnread(id: string): void {
    this.mockNotificationService.markAsUnread(id);
  }

  toggleRead(item: MockNotification): void {
    this.mockNotificationService.toggleRead(item.id);
  }

  markAllAsRead(): void {
    this.mockNotificationService.markAllAsRead();
  }

  delete(id: string): void {
    this.mockNotificationService.delete(id);
  }

  clearAll(): void {
    this.mockNotificationService.clearAll();
  }

  async showTooltip(item: MockNotification): Promise<void> {
    await this.uiToast.show(item.tooltip || 'No tooltip available for this item.', 'medium', 2200);
  }

  trackById(_: number, item: MockNotification): string {
    return item.id;
  }

  private applyFilter(): void {
    if (this.activeFilter === 'unread') {
      this.filteredNotifications = this.notifications.filter((item) => !item.isRead);
      return;
    }

    if (this.activeFilter === 'read') {
      this.filteredNotifications = this.notifications.filter((item) => item.isRead);
      return;
    }

    this.filteredNotifications = [...this.notifications];
  }
}
