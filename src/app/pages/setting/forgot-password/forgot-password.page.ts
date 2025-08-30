import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {

  email: string = '';

  constructor(private authService: AuthService) {}

  sendResetLink() {
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => alert(res.message),
      error: (err) => alert('Error: ' + err.error.message),
    });
  }

}
