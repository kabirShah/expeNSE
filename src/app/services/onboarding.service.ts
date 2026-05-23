import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export enum OnboardingStep {
  START = 'START',
  USER_DETAILS = 'USER_DETAILS',
  PERMISSIONS = 'PERMISSIONS',
  SYNC_INIT = 'SYNC_INIT',
  SYNC_PROGRESS = 'SYNC_PROGRESS',
  COMPLETE = 'COMPLETE'
}

export interface OnboardingFlowState {
  current_step: OnboardingStep;
  sync_status: 'pending' | 'in_progress' | 'done' | 'failed';
  is_completed: boolean;
  permissions_granted: boolean;
  sync_consent_granted: boolean;
  step_payload: Record<string, any>;
  latest_sync_log: any | null;
  sync_started_at?: string | null;
  sync_completed_at?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly storageKey = 'pm_onboarding_state';
  private readonly stateSubject = new BehaviorSubject<OnboardingFlowState>(this.defaultState());
  private initializePromise?: Promise<OnboardingFlowState>;
  private syncPromise?: Promise<OnboardingFlowState>;

  readonly state$ = this.stateSubject.asObservable();

  constructor(private apiService: ApiService) {}

  get snapshot(): OnboardingFlowState {
    return this.stateSubject.value;
  }

  async initialize(force = false): Promise<OnboardingFlowState> {
    if (!force && this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = (async () => {
      const localState = await this.readLocalState();
      this.stateSubject.next(localState);

      try {
        const response = await firstValueFrom(this.apiService.getOnboardingStatus());
        const nextState = this.normalizeServerState(response?.data);
        await this.persistState(nextState);
        this.stateSubject.next(nextState);
      } catch {
        await this.persistState(localState);
      }

      if (this.snapshot.sync_status === 'in_progress') {
        void this.pollSyncStatus();
      }

      return this.snapshot;
    })();

    const result = await this.initializePromise;

    if (force) {
      this.initializePromise = undefined;
    }

    return result;
  }

  async saveStep(
    currentStep: OnboardingStep,
    stepPayload: Record<string, any> = {},
    flags: Partial<Pick<OnboardingFlowState, 'permissions_granted' | 'sync_consent_granted'>> = {}
  ): Promise<OnboardingFlowState> {
    const response = await firstValueFrom(this.apiService.saveOnboardingStep({
      current_step: currentStep,
      step_payload: stepPayload,
      ...flags
    }));
    const nextState = this.normalizeServerState(response?.data);
    await this.persistState(nextState);
    this.stateSubject.next(nextState);
    return nextState;
  }

  async startSync(messages: any[]): Promise<OnboardingFlowState> {
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      const response = await firstValueFrom(this.apiService.initSync(messages));
      const nextState = this.normalizeServerState(response?.data);
      await this.persistState(nextState);
      this.stateSubject.next(nextState);

      if (nextState.sync_status === 'in_progress') {
        return this.pollSyncStatus();
      }

      return nextState;
    })();

    try {
      return await this.syncPromise;
    } finally {
      this.syncPromise = undefined;
    }
  }

  async pollSyncStatus(attempts = 20, delayMs = 2000): Promise<OnboardingFlowState> {
    let current = this.snapshot;

    for (let index = 0; index < attempts; index++) {
      const response = await firstValueFrom(this.apiService.getSyncStatus());
      current = this.normalizeServerState({
        ...this.snapshot,
        ...(response?.data || {})
      });

      await this.persistState(current);
      this.stateSubject.next(current);

      if (current.sync_status !== 'in_progress') {
        return current;
      }

      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }

    return current;
  }

  async completeOnboarding(): Promise<OnboardingFlowState> {
    const response = await firstValueFrom(this.apiService.completeOnboarding());
    const nextState = this.normalizeServerState(response?.data);
    await this.persistState(nextState);
    this.stateSubject.next(nextState);
    return nextState;
  }

  private async readLocalState(): Promise<OnboardingFlowState> {
    const stored = await Preferences.get({ key: this.storageKey });

    if (!stored.value) {
      return this.defaultState();
    }

    try {
      return {
        ...this.defaultState(),
        ...JSON.parse(stored.value)
      };
    } catch {
      return this.defaultState();
    }
  }

  private async persistState(state: OnboardingFlowState): Promise<void> {
    await Preferences.set({
      key: this.storageKey,
      value: JSON.stringify(state)
    });
  }

  private normalizeServerState(data: any): OnboardingFlowState {
    return {
      current_step: (data?.current_step || this.snapshot.current_step || OnboardingStep.START) as OnboardingStep,
      sync_status: data?.sync_status || this.snapshot.sync_status || 'pending',
      is_completed: !!data?.is_completed,
      permissions_granted: !!data?.permissions_granted,
      sync_consent_granted: !!data?.sync_consent_granted,
      step_payload: data?.step_payload || this.snapshot.step_payload || {},
      latest_sync_log: data?.latest_sync_log || null,
      sync_started_at: data?.sync_started_at || null,
      sync_completed_at: data?.sync_completed_at || null
    };
  }

  private defaultState(): OnboardingFlowState {
    return {
      current_step: OnboardingStep.START,
      sync_status: 'pending',
      is_completed: false,
      permissions_granted: false,
      sync_consent_granted: false,
      step_payload: {},
      latest_sync_log: null,
      sync_started_at: null,
      sync_completed_at: null
    };
  }
}
