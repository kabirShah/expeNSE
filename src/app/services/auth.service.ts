import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(public auth: AngularFireAuth, private http: HttpClient) { 

  }
  
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  async registerUser(email:string, password:string){
    return await this.auth.createUserWithEmailAndPassword(email,password);
  }
  async loginUser(email:string,password:string){
    return await this.auth.signInWithEmailAndPassword(email,password);
  }
  async resetPassword(email:string){
    return await this.auth.sendPasswordResetEmail(email);
  }
  async signOut(){
    return await this.auth.signOut();
  }
  
  async getProfile(){
    return await this.auth.currentUser    
  }
  async loginWithGoogle() {
    try {
      const res = await this.auth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      );
      return res;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return error;
    }
  }
  async loginWithFacebook() {
    try {
      const res = await this.auth.signInWithPopup(
        new firebase.auth.FacebookAuthProvider()
      );
      return res;
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
      return error;
    }
  }
}
