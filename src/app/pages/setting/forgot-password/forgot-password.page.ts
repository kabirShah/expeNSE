import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html'
})
export class ForgotPasswordPage {
  form: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private toast: ToastController, private nav: NavController){
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }
  async show(msg: string){ const t = await this.toast.create({message: msg, duration:2000, position:'top'}); t.present(); }
  submit(){
    if(this.form.invalid){ this.show('Enter valid email'); return; }
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: ()=>{ this.show('OTP sent'); this.nav.navigateForward('/otp'); },
      error: ()=> this.show('Failed to send OTP')
    });
  }
}