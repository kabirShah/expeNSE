import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(public auth: AngularFireAuth) { 

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
