import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Ensure AbstractControl is imported
import { Router } from '@angular/router';
import { IonDatetime, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  @ViewChild('dobPicker') dobPicker!: IonDatetime;
  
  regForm!: FormGroup;
  isDatePickerOpen = false;
  passwordType: string = 'password';
  maxDate = new Date().toISOString(); 

  constructor(
    private router: Router,
    private uiToast: UiToastService,
    private loadingController: LoadingController,
    private fb: FormBuilder, 
    private navCtrl: NavController,
    private authService: AuthService
  ) {
    this.setMaxDate(); // Initialize max date for 16+ check
  }

  ngOnInit() {
    this.regForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dob: ['', [Validators.required]], // Removed ageValidator for manual input simplicity, logic handled in submit
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&].{8,}')]],
      confirmPassword: ['', Validators.required],
      rememberMe: [false, Validators.requiredTrue] // Enforce terms acceptance
    }, { validators: this.passwordMatchValidator });
  }

  // --- Date Logic (Manual + Picker) ---

  // 1. Manual Typing Mask (MM/DD/YYYY)
  formatDateInput(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length > 8) value = value.substring(0, 8); // Max 8 digits

    // Add slashes
    if (value.length > 4) {
      value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
    }

    input.value = value; 
    // Update control without emitting event to prevent loops
    this.regForm.get('dob')?.setValue(value, { emitEvent: false });
  }

  // 2. Picker Selection
  onDateSelected(event: any) {
    const isoString = event.detail.value;
    if (isoString) {
      const date = new Date(isoString);
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      
      // Set to MM/DD/YYYY
      this.regForm.get('dob')?.setValue(`${month}/${day}/${year}`);
    }
    this.isDatePickerOpen = false;
  }

  openDatePicker() {
    this.isDatePickerOpen = true;
  }

  setMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 16); 
    this.maxDate = today.toISOString();
  }

  // --- Form Utilities ---

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    await this.uiToast.show(message, color);
  }

  goToLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  convertToYMD(dateString: string): string {
    if (!dateString) return '';

    // Expecting input as MM/DD/YYYY
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;

    const [mm, dd, yyyy] = parts;

    // Return YYYY-MM-DD
    return `${yyyy}-${mm}-${dd}`;
  }

  // --- Submit Logic ---

  async register() {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched(); // Show errors
      await this.showToast('Please fix the errors in the form.', 'danger');
      return;
    }

    if (!navigator.onLine) {
      await this.showToast('No internet connection.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Creating Account...' });
    await loading.present();

    // Prepare data (Ensure gender format)
    const rawData = this.regForm.value;
    const formData = {
      first_name: rawData.firstName,
      last_name: rawData.lastName,
      email: rawData.email,
      phone: rawData.phone,
      dob: this.convertToYMD(rawData.dob), // Send as MM/DD/YYYY string
      gender: rawData.gender.charAt(0).toUpperCase() + rawData.gender.slice(1),
      password: rawData.password,
      password_confirmation: rawData.password, // Some APIs need this
    };

    this.authService?.register(formData)?.subscribe({
      next: async (res) => {
        this.authService.saveSession(res.token, res.user, true);
        await loading.dismiss();
        await this.showToast('Registration successful!', 'success');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = err.error?.message || 'Registration failed. Try again.';
        await this.showToast(msg, 'danger');
      }
    });
  }
}
