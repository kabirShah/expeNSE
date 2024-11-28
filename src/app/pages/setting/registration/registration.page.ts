import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonDatetime, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  @ViewChild('dobPicker') dobPicker!: IonDatetime;

  regForm!: FormGroup; // Initialize properly
  isDatePickerOpen = false;

  constructor(private auth: Auth,private toastCtrl: ToastController, private fb: FormBuilder, private navCtrl: NavController) {}

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
          Validators.minLength(6), // At least 6 characters for password
        ],
      ],
    });
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
    if (this.regForm.valid) {
      const {email, password } = this.regForm.value;
      try{
        await createUserWithEmailAndPassword(this.auth, email, password);
        this.showToast("successfully login");
      }catch (e){
        this.showToast("error");
      }
      console.log('Form Data:', this.regForm.value);
      this.navCtrl.navigateForward('/home');
    } else {
      console.log('Form is Invalid!', this.regForm);
    }
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
