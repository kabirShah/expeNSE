import { Injectable } from '@angular/core';
import { SecureStorage, SecureStoragePlugin } from '@aparajita/capacitor-secure-storage';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private storage: SecureStoragePlugin;

  constructor() {
    this.storage = SecureStorage;
  }

  async set(key: string, value: any): Promise<void> {
    await this.storage.set({ key, value: JSON.stringify(value) });
  }

  async get(key: string): Promise<any> {
    const { value } = await this.storage.get({ key });
    return value ? JSON.parse(value) : null;
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove({ key });
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }
}
