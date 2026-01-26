import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  email = '';
  loading = false;

  constructor(
    private authApi: AuthService,
    private toast: ToastController
  ) {}

  submit() {
    if (!this.email) {
      this.showToast('Please enter your email');
      return;
    }

    this.loading = true;

    this.authApi.forgotPassword(this.email).subscribe({
      next: () => {
        this.showToast('Reset link sent to your email');
        this.loading = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Something went wrong');
        this.loading = false;
      },
    });
  }

  async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2500,
      position: 'top',
    });
    t.present();
  }
}
