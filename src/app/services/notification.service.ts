import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

export interface Notification {
  id?: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseApiService {
  private notificationsUrl = `${this.apiUrl}/notifications`;

  constructor(http: HttpClient) {
    super(http);
  }

  // Get all notifications
  getNotifications(): Observable<{ success: boolean; data: Notification[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Notification[] }>(
      this.notificationsUrl,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get notification by ID
  getNotificationById(id: string): Observable<{ success: boolean; data: Notification }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Notification }>(
      `${this.notificationsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new notification
  createNotification(notification: Notification): Observable<{ success: boolean; data: Notification }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; data: Notification }>(
      this.notificationsUrl,
      notification,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update notification
  updateNotification(id: string, notification: Notification): Observable<{ success: boolean; data: Notification }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.put<{ success: boolean; data: Notification }>(
      `${this.notificationsUrl}/${id}`,
      notification,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete notification
  deleteNotification(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.notificationsUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get unread notifications count
  getUnreadCount(): Observable<{ success: boolean; count: number }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; count: number }>(
      `${this.notificationsUrl}/unread/count`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Mark notification as read
  markAsRead(id: string): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.notificationsUrl}/${id}/read`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<{ success: boolean; message: string }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.post<{ success: boolean; message: string }>(
      `${this.notificationsUrl}/read-all`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get notifications by type
  getNotificationsByType(type: string): Observable<{ success: boolean; data: Notification[] }> {
    if (!this.isOnline()) {
      return this.handleOfflineError();
    }
    
    return this.http.get<{ success: boolean; data: Notification[] }>(
      `${this.notificationsUrl}/type/${type}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
