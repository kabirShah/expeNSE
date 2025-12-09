// src/app/services/base-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected apiUrl = environment.apiURL;

  constructor(protected http: HttpClient) {}

  // Return HttpHeaders (not an options object)
  protected getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) errorMessage = `Error: ${error.error.message}`;
    else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
    }
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  protected isOnline(): boolean {
    return navigator.onLine;
  }

  protected handleOfflineError(): Observable<never> {
    const err = new Error('Internet connection required. Please check your connection and try again.');
    console.error('Offline Error:', err.message);
    return throwError(() => err);
  }
}
