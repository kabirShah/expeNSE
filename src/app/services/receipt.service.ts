import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private apiUrl = `${environment.apiURL}/receipts`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // 🔥 THIS IS MISSING IN YOUR FILE
  uploadReceipt(base64Image: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/upload`,
      {
        image_url: `data:image/jpeg;base64,${base64Image}`
      },
      { headers: this.getAuthHeaders() }
    );
  }

  getReceipts(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}`,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteReceipt(id: string | number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}