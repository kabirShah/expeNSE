import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface AppConfig {
  financial_container_label: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly configSubject = new BehaviorSubject<AppConfig>({
    financial_container_label: 'Balance'
  });

  readonly config$ = this.configSubject.asObservable();

  constructor(private apiService: ApiService) {}

  get value(): AppConfig {
    return this.configSubject.value;
  }

  setConfig(data: Partial<AppConfig> | null | undefined): void {
    this.configSubject.next({
      ...this.configSubject.value,
      ...(data || {})
    });
  }

  getLabel(): string {
    return this.configSubject.value?.financial_container_label || 'Balance';
  }

  async initialize(): Promise<void> {
    try {
      const response = await firstValueFrom(this.apiService.getAppConfig());
      this.setConfig(response?.data);
    } catch {
      this.setConfig({ financial_container_label: 'Balance' });
    }
  }
}
