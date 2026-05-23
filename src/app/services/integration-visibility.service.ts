import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  IntegrationProviderKey,
  IntegrationSourcePreference,
  UserPreferencesService
} from './user-preferences.service';

export interface IntegrationProvider {
  key: IntegrationProviderKey;
  name: string;
  type: 'bank' | 'upi';
  route?: string;
  icon: string;
  accent: string;
  description: string;
  syncMethod: string;
  requirements: string[];
  visibleData: string[];
  supportedFlows: string[];
}

@Injectable({
  providedIn: 'root'
})
export class IntegrationVisibilityService {
  private readonly providers: IntegrationProvider[] = [
    {
      key: 'hdfc',
      name: 'HDFC Bank',
      type: 'bank',
      route: '/integration/hdfc',
      icon: 'business-outline',
      accent: '#0f766e',
      description: 'Track HDFC transaction visibility inside Pocket Money without storing banking credentials in the app.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'User must give integration visibility consent.',
        'Relevant app notification access should be enabled where supported.',
        'The user should review detected transactions before acting on them.'
      ],
      visibleData: [
        'Detected spend amount',
        'Merchant or reference text when available',
        'Approximate transaction date and payment source',
        'Expense visibility in dashboard and expense history'
      ],
      supportedFlows: [
        'Visibility only',
        'Expense tracking',
        'Dashboard surfacing',
        'Payment source labeling'
      ]
    },
    {
      key: 'icici',
      name: 'ICICI Bank',
      type: 'bank',
      route: '/integration/icici',
      icon: 'card-outline',
      accent: '#b45309',
      description: 'Enable ICICI transaction visibility so users can review their expenses from one place.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'User consent is required before visibility is enabled.',
        'Only supported transaction messages should be used for tracking.',
        'Sensitive source records should not be stored through this flow.'
      ],
      visibleData: [
        'Expense amount and timing',
        'Merchant hints from supported messages',
        'Detected payment source',
        'Summary visibility in analytics and dashboard'
      ],
      supportedFlows: [
        'Visibility only',
        'Auto-detected tracking',
        'Recent expense surfacing',
        'Analytics contribution'
      ]
    },
    {
      key: 'kotak',
      name: 'Kotak Bank',
      type: 'bank',
      route: '/integration/kotak',
      icon: 'wallet-outline',
      accent: '#7c3aed',
      description: 'Prepare Kotak visibility so users can see tracked expenses in Pocket Money more clearly.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'Consent must be accepted first.',
        'Only visibility-related tracking is enabled here.',
        'Users should confirm unusual entries manually.'
      ],
      visibleData: [
        'Amount and date detected from supported messages',
        'Provider tagging for bank-originated expenses',
        'Visibility inside expense lists and reports',
        'Dashboard totals after refresh'
      ],
      supportedFlows: [
        'Visibility only',
        'Expense timeline',
        'Reports visibility',
        'Dashboard totals'
      ]
    },
    {
      key: 'axis',
      name: 'Axis Bank',
      type: 'bank',
      route: '/integration/axis',
      icon: 'swap-horizontal-outline',
      accent: '#2563eb',
      description: 'Keep Axis transactions visible in the app when supported messages are available.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'Integration visibility must stay enabled in settings.',
        'Supported message access is required.',
        'No banking password or credential storage is part of this setup.'
      ],
      visibleData: [
        'Expense amount and source hints',
        'Detected merchant text when available',
        'Timeline visibility inside the app',
        'Contribution to dashboards and summaries'
      ],
      supportedFlows: [
        'Visibility only',
        'Bank expense detection',
        'Summary contribution',
        'Review before confirm'
      ]
    },
    {
      key: 'sbi',
      name: 'SBI',
      type: 'bank',
      route: '/integration/sbi',
      icon: 'shield-checkmark-outline',
      accent: '#0284c7',
      description: 'Show SBI expense visibility in Pocket Money through supported detection channels.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'Visibility consent must be recorded once.',
        'Supported system permissions may be needed on the device.',
        'This setup should not be used to store source banking data.'
      ],
      visibleData: [
        'Detected outgoing amounts',
        'Relevant date context',
        'Payment source appearance in tracked expenses',
        'Visibility in dashboard and analytics'
      ],
      supportedFlows: [
        'Visibility only',
        'Tracked expense surfacing',
        'Analytics participation',
        'Dashboard contribution'
      ]
    },
    {
      key: 'rbl',
      name: 'RBL Bank',
      type: 'bank',
      route: '/integration/rbl',
      icon: 'cash-outline',
      accent: '#dc2626',
      description: 'Enable RBL transaction visibility for clearer expense tracking without storing credentials.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'User consent is mandatory.',
        'Users should keep integration visibility enabled globally.',
        'Only supported transaction signals are used.'
      ],
      visibleData: [
        'Detected spend information',
        'Reference details if parsable',
        'Expense history visibility',
        'Summary visibility throughout the app'
      ],
      supportedFlows: [
        'Visibility only',
        'Expense recognition',
        'History surfacing',
        'Summary tracking'
      ]
    },
    {
      key: 'yes',
      name: 'YES Bank',
      type: 'bank',
      route: '/integration/yes',
      icon: 'checkmark-done-outline',
      accent: '#16a34a',
      description: 'Keep YES Bank expenses visible in the app with clear privacy boundaries.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'Consent is captured before enablement.',
        'The user should verify detected records as needed.',
        'This flow does not store credentials or raw banking records here.'
      ],
      visibleData: [
        'Amount and date hints',
        'Merchant text when available',
        'Dashboard visibility of tracked expenses',
        'Expense list contribution'
      ],
      supportedFlows: [
        'Visibility only',
        'Tracked expenses',
        'Dashboard visibility',
        'Review workflow'
      ]
    },
    {
      key: 'federal',
      name: 'Federal Bank',
      type: 'bank',
      route: '/integration/federal',
      icon: 'layers-outline',
      accent: '#9333ea',
      description: 'Prepare Federal Bank visibility so supported spend entries can appear in Pocket Money.',
      syncMethod: 'Visibility via supported notifications and user-controlled integration review.',
      requirements: [
        'Global integration visibility should remain enabled.',
        'Supported device permissions may be required.',
        'Only visibility use cases are covered by this page.'
      ],
      visibleData: [
        'Detected expense amount',
        'Relevant date and source details',
        'Visibility across reports and analytics',
        'Recent expense surfacing after refresh'
      ],
      supportedFlows: [
        'Visibility only',
        'Reports contribution',
        'Analytics support',
        'Recent activity visibility'
      ]
    },
    {
      key: 'phonepe',
      name: 'PhonePe',
      type: 'upi',
      icon: 'phone-portrait-outline',
      accent: '#6d28d9',
      description: 'Track supported PhonePe transaction visibility within the app.',
      syncMethod: 'Visibility via supported notifications and user-controlled review.',
      requirements: [
        'Consent is required first.',
        'Only visibility support is provided here.',
        'Sensitive source data should not be stored through this setup.'
      ],
      visibleData: [
        'Detected outgoing amount',
        'Payment source labeling',
        'Expense list visibility',
        'Dashboard contribution'
      ],
      supportedFlows: [
        'Visibility only',
        'UPI expense tagging',
        'Expense list visibility',
        'Dashboard totals'
      ]
    },
    {
      key: 'gpay',
      name: 'Google Pay',
      type: 'upi',
      icon: 'logo-google',
      accent: '#2563eb',
      description: 'Track supported Google Pay transaction visibility within the app.',
      syncMethod: 'Visibility via supported notifications and user-controlled review.',
      requirements: [
        'Consent is required first.',
        'Only visibility support is provided here.',
        'Sensitive source data should not be stored through this setup.'
      ],
      visibleData: [
        'Detected outgoing amount',
        'Payment source labeling',
        'Expense list visibility',
        'Dashboard contribution'
      ],
      supportedFlows: [
        'Visibility only',
        'UPI expense tagging',
        'Expense list visibility',
        'Dashboard totals'
      ]
    }
  ];

  constructor(private userPreferences: UserPreferencesService) {}

  getProviders(type?: 'bank' | 'upi'): IntegrationProvider[] {
    return this.providers.filter((provider) => !type || provider.type === type);
  }

  getProvider(key: IntegrationProviderKey): IntegrationProvider | undefined {
    return this.providers.find((provider) => provider.key === key);
  }

  getProviderState(key: IntegrationProviderKey): IntegrationSourcePreference {
    const sources = this.userPreferences.getIntegrationSources();
    const current = sources[key];

    return {
      enabled: !!current?.enabled,
      visibility_mode: 'visibility_only',
      consented_at: current?.consented_at || null,
      last_reviewed_at: current?.last_reviewed_at || null
    };
  }

  getEnabledCount(type?: 'bank' | 'upi'): number {
    return this.getProviders(type).filter((provider) => this.getProviderState(provider.key).enabled).length;
  }

  saveProviderState(key: IntegrationProviderKey, enabled: boolean): Observable<any> {
    const currentSources = this.userPreferences.getIntegrationSources();
    const current = currentSources[key];
    const now = new Date().toISOString();

    return this.userPreferences.savePreferences({
      integration_sources: {
        ...currentSources,
        [key]: {
          enabled,
          visibility_mode: 'visibility_only',
          consented_at: current?.consented_at || now,
          last_reviewed_at: now
        }
      }
    });
  }

  saveProviderStates(keys: IntegrationProviderKey[], enabled: boolean): Observable<any> {
    const currentSources = this.userPreferences.getIntegrationSources();
    const now = new Date().toISOString();
    const nextSources = { ...currentSources };

    keys.forEach((key) => {
      const current = currentSources[key];
      nextSources[key] = {
        enabled,
        visibility_mode: 'visibility_only',
        consented_at: current?.consented_at || now,
        last_reviewed_at: now
      };
    });

    return this.userPreferences.savePreferences({
      integration_sources: nextSources
    });
  }
}
