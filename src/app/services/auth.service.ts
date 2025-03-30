import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { Observable , throwError} from 'rxjs';
import { Platform } from '@ionic/angular';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private API_URL = 'http://127.0.0.1:8000/api';
  user: any = null;
  constructor(private http: HttpClient){  

  }
  // Login User
  loginLaravel(email: string, password:string) {
    return this.http.post(`${this.API_URL}/login`,{ email, password});
  }
  
  // Register User with Laravel API
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData).pipe(
      catchError((error) => {
        console.error('Laravel Registration Error:', error);
        return throwError(error);
      })
    );
  }
  sendOtp(mobile: string): Observable<any> {
    return this.http.post(`${this.API_URL}/send-otp`, { mobile });
  }

  verifyOtp(mobile: string, otp: string): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-otp`, { mobile, otp });
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token'); // Returns true if token exists
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
