import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(public ngFireAUth: AngularFireAuth) { 

  }
  async registerUser(email:string, password:string){
    return await this.ngFireAUth.createUserWithEmailAndPassword(email,password);
  }
  async loginUser(email:string,password:string){
    return await this.ngFireAUth.signInWithEmailAndPassword(email,password);
  }
  async resetPassword(email:string){
    return await this.ngFireAUth.sendPasswordResetEmail(email);
  }
  async signOut(){
    return await this.ngFireAUth.signOut();
  }
  async getProfile(){
    return await this.ngFireAUth.currentUser    
  }
}
