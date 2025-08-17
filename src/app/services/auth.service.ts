import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private API_URL = 'http://127.0.0.1:8000/api';
  TOKEN_EXPIRY_DAYS = 7;
  user: any = null;
  constructor(private http: HttpClient,private router: Router) { 

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
  async resetPassword(email:string){
    // return await this.auth.sendPasswordResetEmail(email);
  }
  async signOut(){
    // return await this.auth.signOut();
  }
  
  async getProfile(){
    // return await this.auth.currentUser    
  }
  async loginWithGoogle() {
    // try {
    //   const res = await this.auth.signInWithPopup(
    //     new firebase.auth.GoogleAuthProvider()
    //   );
    //   return res;
    // } catch (error) {
    //   console.error('Google Sign-In Error:', error);
    //   return error;
    // }
  }
  async loginWithFacebook() {
    // try {
    //   const res = await this.auth.signInWithPopup(
    //     new firebase.auth.FacebookAuthProvider()
    //   );
    //   return res;
    // } catch (error) {
    //   console.error('Facebook Sign-In Error:', error);
    //   return error;
    // }
  }
}
