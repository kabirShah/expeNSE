import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FacebookLogin, FacebookLoginResponse } from '@capacitor-community/facebook-login';
import { isPlatform, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private API_URL = `${environment.apiURL}`;
  TOKEN_EXPIRY_DAYS = 7;
  user: any = null;
  constructor(private http: HttpClient,private router: Router, private platform: Platform) { 
    if(!isPlatform('capacitor')){
      GoogleAuth.initialize();
    }
  }

  getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return { Authorization: `Bearer ${token}` };
}


// ONLINE LOGIN
  loginLaravel(email: string, password: string) {
    if (!navigator.onLine) {
      alert('Internet connection required for login.');
      return;
    }

    return this.http.post<any>(`${this.API_URL}/login`, { email, password }).pipe(
      tap((response) => {
        if (response && response.user && response.token) {
          localStorage.setItem('user_id', response.user.id.toString());
          localStorage.setItem('user_name', response.user.name);
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('loginTime',new Date().getTime().toString());
          localStorage.setItem('token_timestamp', new Date().getTime().toString());

        }
      })
    );
  }

  


    
  register(userData: any) {
    if (!navigator.onLine) {
      alert('Internet required for registration.');
      return;
    }
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_timestamp');
    this.router.navigate(['/login']);
  }
  forgotPassword(email: string) {
    return this.http.post<any>(`${this.API_URL}/forgot-password`, { email });
  }
  resetPassword(data: any) {
    return this.http.post<any>(`${this.API_URL}/reset-password`, data);
  }
  
  // CHECK IF LOGGED IN & TOKEN VALID (< 7 days)
  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    const tokenTimestamp = localStorage.getItem('token_timestamp');

    if (!token || !tokenTimestamp) {
      return false;
    }

    const savedTime = new Date(tokenTimestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - savedTime.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > this.TOKEN_EXPIRY_DAYS) {
      this.logout();
      alert('Session expired. Please login again.');
      return false;
    }

    return true;
  }

  // Get stored user
  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id) : null;
  }

  getUserName(): string | null {
    return localStorage.getItem('user_name');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  async loginUser(email:string,password:string){
    // return await this.auth.signInWithEmailAndPassword(email,password);
    
  }

  async signOut(){
    // return await this.auth.signOut();
  }
  
  getProfile(): Observable<any> | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.http.get<any>(`${this.API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  
  async loginWithGoogle() {
    try {
      const googleUser = await GoogleAuth.signIn();
      console.log('Google User:', googleUser);

      // Send token to Laravel
      return this.http.post(`${this.API_URL}/google-login`, {
        idToken: googleUser.authentication.idToken
      }).toPromise();

    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }

  }
  
  async loginWithFacebook() {
   const result: FacebookLoginResponse = await FacebookLogin.login({ permissions: ['email', 'public_profile'] });
    if (result.accessToken) {
      return this.http.post(`${this.API_URL}/auth/facebook`, {
        accessToken: result.accessToken.token
      }).toPromise();
    } else {
      throw new Error('Facebook login failed or cancelled');
    }
  }
  saveToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  getDashboard(month?: number, year?: number): Observable<any> {
    let url = `${this.API_URL}/dashboard`;
    const params: any = {};

    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get(url, {
      params,
      headers: this.getAuthHeaders()
    });
  }
}
