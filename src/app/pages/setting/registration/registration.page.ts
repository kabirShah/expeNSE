import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonDatetime, LoadingController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  @ViewChild('dobPicker') dobPicker!: IonDatetime;
  formattedDOB = '';
  maxDate = new Date().toISOString(); 
  regForm!: FormGroup; // Initialize properly
  isDatePickerOpen = false;
  passwordType: string = 'password';
  constructor(
    private router:Router,
    private toastCtrl: ToastController,
    private loadingController: LoadingController,
    private fb: FormBuilder, 
    private navCtrl: NavController,
    private authService: AuthService) {

    }

  ngOnInit() {
    // Define FormGroup and validations
    this.regForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/), // Ensures valid 10-digit numbers
        ],
      ],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-8])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
        ],
      ],
    });
  }
  get errorControl() {
    return this.regForm.controls;
  }
   // Show Toast Notification
   async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    await toast.present();
  }
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
  
  // Registration logic
  async register() {
    if (this.regForm.invalid) {
      await this.showToast('Please fill in all required fields.', 'danger');
      return;
    }
  
    const formData = {
      first_name: this.regForm.value.firstName,
      last_name: this.regForm.value.lastName,
      email: this.regForm.value.email,
      phone: this.regForm.value.phone,
      dob: this.regForm.value.dob,
      gender: this.regForm.value.gender.charAt(0).toUpperCase() + this.regForm.value.gender.slice(1),
      password: this.regForm.value.password,
      password_confirmation: this.regForm.value.password,
    };
  
    console.log(formData);
  
    const loading = await this.loadingController.create({ message: 'Registering...' });
    await loading.present();
  
    this.authService.register(formData).subscribe(
      async (res) => {
        await loading.dismiss();
        await this.showToast('Registration successful!', 'success');
        this.router.navigate(['/home']);
      },
      async (err) => {
        await loading.dismiss();
        await this.showToast('Error: ' + JSON.stringify(err.error), 'danger');
      }
    );
  }
  
  

  // Open date picker
  openDatePicker() {
    this.isDatePickerOpen = true;
  }

  // Handle date change
  onDateChange(event: any) {
    const selectedDate = event.detail.value;
    this.regForm.patchValue({ dob: selectedDate });
    this.isDatePickerOpen = false;
  }
  
}