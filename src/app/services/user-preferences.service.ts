import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export type StoragePreference = 'cloud_sync' | 'device_only' | 'hybrid';
export type IntegrationProviderKey =
  | 'hdfc'
  | 'icici'
  | 'kotak'
  | 'axis'
  | 'sbi'
  | 'rbl'
  | 'yes'
  | 'federal'
  | 'phonepe'
  | 'gpay';

export interface IntegrationSourcePreference {
  enabled: boolean;
  visibility_mode: 'visibility_only';
  consented_at?: string | null;
  last_reviewed_at?: string | null;
}

export interface UserPreferences {
  budget_mode?: string | null;
  monthly_budget?: number | null;
  category_budget?: Record<string, number> | null;
  warning_threshold?: number | null;
  saving_goal?: string | null;
  saving_target?: number | null;
  tips_enabled?: boolean;
  tips_types?: string[] | null;
  notification_frequency?: string | null;
  notify_time?: string | null;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  storage_preference?: StoragePreference;
  favorite_categories?: string[] | null;
  setup_wallet_name?: string | null;
  setup_wallet_type?: string | null;
  setup_wallet_balance?: number | null;
  setup_budget_name?: string | null;
  setup_budget_amount?: number | null;
  setup_budget_period?: string | null;
  integration_visibility_enabled?: boolean;
  integration_visibility_consent_at?: string | null;
  integration_sources?: Partial<Record<IntegrationProviderKey, IntegrationSourcePreference>> | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly apiUrl = `${environment.apiURL}/preferences`;
  private readonly fallbackCategories = [
    { id: 1, name: 'Food', slug: 'food' },
    { id: 2, name: 'Shopping', slug: 'shopping' },
    { id: 3, name: 'Travel', slug: 'travel' },
    { id: 4, name: 'Bills', slug: 'bills' },
    { id: 5, name: 'Recharge', slug: 'recharge' },
    { id: 6, name: 'Entertainment', slug: 'entertainment' },
    { id: 7, name: 'Other', slug: 'other' }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getDefaultCategories() {
    return [...this.fallbackCategories];
  }

  getLocalPreferences(): UserPreferences {
    const raw = localStorage.getItem(this.getPreferenceKey());
    if (!raw) {
      return this.getDefaultPreferences();
    }

    try {
      return { ...this.getDefaultPreferences(), ...JSON.parse(raw) };
    } catch {
      return this.getDefaultPreferences();
    }
  }

  cachePreferences(preferences: Partial<UserPreferences>): UserPreferences {
    const merged = {
      ...this.getLocalPreferences(),
      ...preferences
    };

    localStorage.setItem(this.getPreferenceKey(), JSON.stringify(merged));

    if (merged.storage_preference) {
      localStorage.setItem(this.getStorageKey(), merged.storage_preference);
    }

    return merged;
  }

  getStoragePreference(): StoragePreference {
    const stored = localStorage.getItem(this.getStorageKey()) as StoragePreference | null;
    return stored || this.getLocalPreferences().storage_preference || 'cloud_sync';
  }

  isDeviceOnlyMode(): boolean {
    return this.getStoragePreference() === 'device_only';
  }

  isIntegrationVisibilityEnabled(): boolean {
    return !!this.getLocalPreferences().integration_visibility_enabled;
  }

  hasIntegrationVisibilityConsent(): boolean {
    return !!this.getLocalPreferences().integration_visibility_consent_at;
  }

  getIntegrationSources(): Partial<Record<IntegrationProviderKey, IntegrationSourcePreference>> {
    return this.getLocalPreferences().integration_sources || {};
  }

  loadPreferences(): Observable<UserPreferences> {
    const token = this.authService.getToken();
    if (!token) {
      return of(this.getLocalPreferences());
    }

    return this.http.get<{ success: boolean; data: UserPreferences | null }>(this.apiUrl).pipe(
      map((res) => res?.data || null),
      tap((prefs) => {
        if (prefs) {
          this.cachePreferences(prefs);
        }
      }),
      map((prefs) => prefs ? ({ ...this.getDefaultPreferences(), ...prefs }) : this.getLocalPreferences()),
      catchError(() => of(this.getLocalPreferences()))
    );
  }

  savePreferences(preferences: Partial<UserPreferences>, persistRemote: boolean = true): Observable<UserPreferences> {
    const cached = this.cachePreferences(preferences);

    if (!persistRemote || this.isDeviceOnlyPreference(preferences)) {
      return of(cached);
    }

    return this.http.post<{ success: boolean; data: UserPreferences }>(this.apiUrl, preferences).pipe(
      map((res) => res?.data || cached),
      tap((prefs) => this.cachePreferences(prefs)),
      catchError(() => of(cached))
    );
  }

  shouldShowOnboarding(): Observable<boolean> {
    return this.loadPreferences().pipe(
      map((prefs) => !prefs.onboarding_completed)
    );
  }

  private isDeviceOnlyPreference(preferences: Partial<UserPreferences>): boolean {
    return (preferences.storage_preference || this.getStoragePreference()) === 'device_only';
  }

  private getPreferenceKey(): string {
    return `pm_user_preferences_${this.getCurrentUserId()}`;
  }

  private getStorageKey(): string {
    return `pm_storage_preference_${this.getCurrentUserId()}`;
  }

  private getCurrentUserId(): string {
    const user = this.authService.getUser();
    const userId = user?.id ?? localStorage.getItem('user_id') ?? sessionStorage.getItem('user_id') ?? 'guest';
    return String(userId);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      onboarding_completed: false,
      storage_preference: 'cloud_sync',
      warning_threshold: 80,
      tips_enabled: true,
      favorite_categories: [],
      integration_visibility_enabled: false,
      integration_visibility_consent_at: null,
      integration_sources: {}
    };
  }
}
