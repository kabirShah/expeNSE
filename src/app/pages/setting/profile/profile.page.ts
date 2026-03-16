import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: any = null;
  isLoading = true;

  apiBase = environment.apiURL; // ✅ FIX

  selectedFile: File | null = null;
  previewImage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onImageError(event: any) {
    event.target.src = 'assets/profile.png';
  }

  updateProfile() {
    const formData = new FormData();

    formData.append('first_name', this.user.first_name || '');
    formData.append('last_name', this.user.last_name || '');
    formData.append('phone', this.user.phone || '');
    formData.append('dob', this.user.dob || '');
    formData.append('gender', this.user.gender || '');

    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.authService.updateProfile(formData).subscribe(() => {
      this.previewImage = null;
      this.selectedFile = null;
      this.loadProfile();
      this.router.navigate(['/setting']);
    });
  }
}
