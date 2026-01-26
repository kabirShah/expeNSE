import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'], // Ensure this links to the CSS I gave you
})
export class ResetPasswordPage implements OnInit {
  // --- Data Variables ---
  email = '';
  token = '';
  password = '';
  confirmPassword = '';
  loading = false;

  // --- UI State Variables (New) ---
  showPassword = false; // Toggles the eye icon
  focusP = false;       // Highlights input when typing

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authApi: AuthService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    // Capture the hidden tokens from the email link
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  // --- UI Helper Methods (Used in HTML) ---

  // Checks if string contains a number (for the checklist)
  hasNumber(str: string): boolean {
    return /\d/.test(str);
  }

  // Validates the form state for the Button [disabled] property
  isValid(): boolean {
    return (
      this.password.length >= 8 &&        // Rule 1: Length
      this.hasNumber(this.password) &&    // Rule 2: Complexity
      this.password === this.confirmPassword // Rule 3: Match
    );
  }

  // --- Main Action ---
  reset() {
    // Extra safety: Stop if validation fails (even if button wasn't disabled)
    if (!this.isValid()) {
      this.showToast('Please meet all password requirements.');
      return;
    }

    this.loading = true;

    this.authApi.resetPassword({
      email: this.email,
      token: this.token,
      password: this.password,
      password_confirmation: this.confirmPassword,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Password reset successful');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.error?.message || 'Reset failed');
      }
    });
  }

  async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2500,
      position: 'top',
      color: message.includes('success') ? 'success' : 'danger', // UX: Color code the toast
      icon: message.includes('success') ? 'checkmark-circle' : 'alert-circle',
    });
    t.present();
  }
}