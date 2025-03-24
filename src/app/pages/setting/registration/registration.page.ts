import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonDatetime, LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  @ViewChild('dobPicker') dobPicker!: IonDatetime;

  regForm!: FormGroup; // Initialize properly
  isDatePickerOpen = false;

  constructor(
    private auth: Auth,
    private router:Router,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private loadingController: LoadingController,
    private fb: FormBuilder, private navCtrl: NavController) {}

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
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  // Registration logic
  async register() {
    if (this.regForm.invalid) return;

    const loading = await this.loadingController.create({ message: 'Logging in...' });
    await loading.present();
  
    this.http.post('http://127.0.0.1:8000/api/register', this.regForm.value).subscribe(
      async (res: any) => {
        await loading.dismiss();
        localStorage.setItem('token', res.token);
        this.showToast('Login successful!');
        this.router.navigate(['/home']);
      },
      async (error) => {
        await loading.dismiss();
        this.showToast(error.error.message || 'Invalid email or password.');
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
