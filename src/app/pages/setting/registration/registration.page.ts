import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonDatetime, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { UserPreferencesService } from 'src/app/services/user-preferences.service';

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
    private authService: AuthService,
    private userPreferences: UserPreferencesService
  ) {
    this.setMaxDate(); // Initialize max date for 16+ check
  }

  ngOnInit() {
    this.regForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dob: ['', [Validators.required, this.validDobValidator()]],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&].{8,}')]],
      confirmPassword: ['', Validators.required],
      rememberMe: [false, Validators.requiredTrue] // Enforce terms acceptance
    }, { validators: this.passwordMatchValidator });
  }

  // --- Date Logic (Manual + Picker) ---

  // 1. Manual Typing Mask (DD/MM/YYYY)
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
    this.regForm.get('dob')?.updateValueAndValidity({ emitEvent: false });
  }

  // 2. Picker Selection
  onDateSelected(event: any) {
    const isoString = event.detail.value;
    if (isoString) {
      const [datePart] = String(isoString).split('T');
      const [year, month, day] = datePart.split('-');

      if (year && month && day) {
        this.regForm.get('dob')?.setValue(`${day}/${month}/${year}`);
      }

      this.regForm.get('dob')?.markAsTouched();
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

  private parseDob(dateString: string): { day: string; month: string; year: string; parsedDate: Date } | null {
    const value = String(dateString ?? '').trim();
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) {
      return null;
    }

    const [, day, month, year] = match;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== Number(year) ||
      parsedDate.getMonth() + 1 !== Number(month) ||
      parsedDate.getDate() !== Number(day)
    ) {
      return null;
    }

    return { day, month, year, parsedDate };
  }

  convertToYMD(dateString: string): string {
    const dob = this.parseDob(dateString);
    if (!dob) return '';

    return `${dob.year}-${dob.month}-${dob.day}`;
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
      dob: this.convertToYMD(rawData.dob), // Send as YYYY-MM-DD string
      gender: rawData.gender.charAt(0).toUpperCase() + rawData.gender.slice(1),
      password: rawData.password,
      password_confirmation: rawData.password, // Some APIs need this
    };

    this.authService?.register(formData)?.subscribe({
      next: async (res) => {
        this.authService.saveSession(res.token, res.user, true);
        this.userPreferences.cachePreferences({
          onboarding_completed: false,
          storage_preference: 'cloud_sync'
        });
        await loading.dismiss();
        await this.showToast('Registration successful!', 'success');
        this.router.navigateByUrl('/onboarding', { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
        const validationErrors = err.error?.errors;
        let firstValidationMessage = '';

        if (validationErrors) {
          const validationKeys = Object.keys(validationErrors);
          const firstKey = validationKeys.length ? validationKeys[0] : '';
          const firstErrorSet = firstKey ? validationErrors[firstKey] : null;

          if (Array.isArray(firstErrorSet) && firstErrorSet.length) {
            firstValidationMessage = String(firstErrorSet[0]);
          } else if (typeof firstErrorSet === 'string') {
            firstValidationMessage = firstErrorSet;
          }
        }

        const msg =
          firstValidationMessage ||
          err.error?.message ||
          'Registration failed. Try again.';
        await this.showToast(msg, 'danger');
      }
    });
  }

  private validDobValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const value = String(control.value ?? '').trim();
      if (!value) return null;

      const dob = this.parseDob(value);
      if (!dob) {
        return { invalidDob: true };
      }

      // Age check (16+)
      const maxAllowedDate = new Date(this.maxDate);
      maxAllowedDate.setHours(0, 0, 0, 0);

      return dob.parsedDate > maxAllowedDate ? { underAge: true } : null;
    };
  }
}
