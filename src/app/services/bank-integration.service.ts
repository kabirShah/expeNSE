import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BankIntegrationService {
  constructor(private api: ApiService) {}

  uploadStatement(bank: 'HDFC' | 'ICICI' | 'Kotak', file: File) {
    const form = new FormData();
    form.append('bank', bank);
    form.append('file', file);
    return this.api.post(`/banks/upload-statement`, form as any);
  }

  listTransactions(bank: 'HDFC' | 'ICICI' | 'Kotak', month?: string) {
    const q = month ? `?month=${month}` : '';
    return this.api.get(`/banks/${bank}/transactions${q}`);
  }
}

