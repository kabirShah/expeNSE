import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  email = '';
  loading = false;

  constructor(
    private authApi: AuthService,
    private uiToast: UiToastService
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
    await this.uiToast.show(message, 'primary');
  }
}
