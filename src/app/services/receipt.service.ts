import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UploadReceiptPayload {
  image_url: string;
  amount?: number | null;
  title?: string | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Correct endpoint for base64 uploads
  saveReceipt(base64Image: string, amount?: number | null, notes?: string): Observable<any> {

    const payload: UploadReceiptPayload = {
      image_url: base64Image,
      amount: amount ?? null,
      title: notes ?? undefined
    };

    return this.http.post(
      `${this.apiUrl}/receipt`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  getReceipts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/receipt`, { headers: this.getAuthHeaders() });
  }

  deleteReceipt(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/receipt/${id}`, { headers: this.getAuthHeaders() });
  }
}
