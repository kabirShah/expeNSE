import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    const loading = await this.loadingController.create();
    await loading.present();
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
