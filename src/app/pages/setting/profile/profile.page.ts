import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
user: any = null;
  isLoading = true;
  apiBase = 'http://127.0.0.1:8000'; // Laravel backend

  selectedFile: File | null = null;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadProfile();
  }

  // Fetch profile from Laravel
  loadProfile() {
    this.http.get(`${this.apiBase}/api/user`, { headers: this.authService.getAuthHeaders() })
      .subscribe({
        next: (res: any) => {
          this.user = res;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading profile', err);
          this.isLoading = false;
        }
      });
  }

  // Handle file input
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Update profile
  updateProfile() {
    const formData = new FormData();
    formData.append('first_name', this.user.first_name);
    formData.append('last_name', this.user.last_name);
    formData.append('phone', this.user.phone);
    formData.append('dob', this.user.dob);
    formData.append('gender', this.user.gender);

    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.http.post(`${this.apiBase}/api/settings/update-profile`, formData, { headers: this.authService.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          console.log('Profile updated:', res);
          this.loadProfile(); // reload after update
        },
        error: (err) => console.error('Update error:', err)
      });
      this.router.navigate(['/setting']);
  }
}
