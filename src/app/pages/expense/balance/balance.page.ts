import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
    selector: 'app-balance',
    templateUrl: './balance.page.html',
    standalone: false
})
export class BalancePage implements OnInit {
  balanceForm!: FormGroup;
  BalanceId: string | null = null;
  balanceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private db: DatabaseService,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.createForm();
    this.balanceId = this.route.snapshot.paramMap.get('id');
    if (this.balanceId) {
      this.loadBalance(this.balanceId);
    }
  }

  // Load balance details (for updating)
  async loadBalance(id: string) {
    try {
      const balanceDoc = await this.db.getBalanceById(id);
      if (balanceDoc) {
        this.balanceForm.patchValue({
          _id: balanceDoc._id,
          _rev: balanceDoc._rev || '',
          amount: balanceDoc.amount,
          source: balanceDoc.source || '', // Load source if available
        });
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }

  // Create form with balance and source fields
  createForm() {
    this.balanceForm = this.fb.group({
      _id: [''],
      _rev:[''],
      amount: ['', Validators.required, Validators.min(1)],
      source: ['', Validators.required], // New field for balance source
    });
  }

  // Save balance (Add or Update)
  async saveBalance() {
    if (this.balanceForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please enter a valid balance!', 'danger');
      return;
    }

    const balanceData = this.balanceForm.value;

    try {
      if (this.balanceId) {
        const existingBalance = await this.db.getBalanceById(this.balanceId);

        if (existingBalance && existingBalance._id) {
          balanceData._id = existingBalance._id;
          balanceData._rev = existingBalance._rev;

          await this.db.updateBalance(balanceData); // 🔥 Pass full object
          await this.showToast('Balance Updated Successfully', 'success');
          console.log("Balance Updated");
        } else {
          await this.showToast('Balance not found', 'danger');
          console.error("Balance not found");
        }
      } else {
        delete balanceData._rev; // 🔥 Ensure clean insert
        await this.db.addBalance({
          ...balanceData,
          dateAdded: new Date().toISOString(),
        });

        await this.showToast('Balance Added Successfully', 'success');
        console.log('Balance added successfully');
      }

      this.balanceForm.reset();
      this.navCtrl.navigateBack('/home'); // 🔥 Redirect correctly
    } catch (error) {
      console.error('Error saving balance', error);
    }
  }

  
  
  

  // Show toast messages
  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
