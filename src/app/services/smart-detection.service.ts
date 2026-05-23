import { Injectable } from '@angular/core';
import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationExpenseService } from './notification-expense.service';

interface SmartDetectionPlugin {
  requestPermission(): Promise<{ openedSettings: boolean; enabled: boolean }>;
  isEnabled(): Promise<{ enabled: boolean }>;
  addListener(
    eventName: 'transactionNotification',
    listenerFunc: (event: SmartDetectionEvent) => void
  ): Promise<PluginListenerHandle>;
}

interface SmartDetectionEvent {
  packageName?: string;
  title?: string;
  text?: string;
  postedAt?: number;
}

const SmartDetection = registerPlugin<SmartDetectionPlugin>('SmartDetection');

@Injectable({ providedIn: 'root' })
export class SmartDetectionService {
  private listener?: PluginListenerHandle;
  private readonly financialPackages = [
    'com.google.android.apps.nbu.paisa.user',
    'net.one97.paytm',
    'com.phonepe.app',
    'com.csam.icici.bank.imobile',
    'com.snapwork.hdfc',
    'com.sbi.SBIFreedomPlus',
    'com.axis.mobile',
    'com.kotak'
  ];

  constructor(
    private authService: AuthService,
    private notificationExpenseService: NotificationExpenseService
  ) {}

  async enableSmartTracking(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    const state = await SmartDetection.isEnabled();
    if (!state.enabled) {
      await SmartDetection.requestPermission();
    }

    await this.start();
    localStorage.setItem('smart_tracking_enabled', 'true');
    return true;
  }

  async start(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.listener) {
      return;
    }

    this.listener = await SmartDetection.addListener('transactionNotification', (event) => {
      void this.handleNotification(event);
    });
  }

  async startIfEnabled(): Promise<void> {
    if (localStorage.getItem('smart_tracking_enabled') !== 'true') {
      return;
    }

    await this.start();
  }

  private async handleNotification(event: SmartDetectionEvent): Promise<void> {
    const rawText = [event.title, event.text].filter(Boolean).join(' ').trim();
    if (!rawText || !this.shouldProcess(event.packageName, rawText)) {
      return;
    }

    const userId = Number(this.authService.getUser()?.id || localStorage.getItem('user_id') || 0);
    if (!userId) {
      return;
    }

    const result = await firstValueFrom(this.notificationExpenseService.processNotification(
      event.packageName || '',
      event.title || '',
      event.text || '',
      userId,
      event.postedAt
    ));

    if (result?.success && !result.is_duplicate) {
      window.dispatchEvent(new CustomEvent('expense:auto-detected', { detail: result.data }));
    }
  }

  private shouldProcess(packageName: string | undefined, text: string): boolean {
    const lowerPackage = (packageName || '').toLowerCase();
    const lowerText = text.toLowerCase();

    return this.financialPackages.some((item) => lowerPackage.includes(item.toLowerCase()))
      || /\b(debited|credited|paid|received|upi|rs\.?|inr|txn|transaction)\b|₹/i.test(lowerText);
  }
}
