import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private API_URL = 'http://192.168.121.180:8000/api';

  user: any = null;
  constructor(private http: HttpClient) { 

  }

  // Login User
  loginLaravel(email: string, password:string) {
    return this.http.post(`${this.API_URL}/login`,{ email, password});
  }

    
  register(userData:any){
    return this.http.post(`${this.API_URL}/register`, userData);
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
