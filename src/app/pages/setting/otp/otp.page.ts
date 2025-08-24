import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({ selector: 'app-otp', templateUrl: './otp.page.html' })
export class OtpPage {
  form: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private toast: ToastController, private nav: NavController){
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], otp: ['', [Validators.required]], password: ['', [Validators.required, Validators.minLength(6)]] });
  }
  async show(msg: string){ const t = await this.toast.create({message: msg, duration:2000, position:'top'}); t.present(); }
  submit(){
    if(this.form.invalid){ this.show('Fill all fields'); return; }
    const { email, otp, password } = this.form.value;
    this.auth.resetPassword(email, otp, password).subscribe({
      next: ()=>{ this.show('Password reset'); this.nav.navigateRoot('/login'); },
      error: ()=> this.show('Reset failed')
    });
  }
}

