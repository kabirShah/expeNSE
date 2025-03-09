import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.page.html',
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
    this.BalanceId = this.route.snapshot.paramMap.get('id');
    if (this.BalanceId) {
      this.loadBalance(this.BalanceId);
    }
  }

  // Load balance details (for updating)
  async loadBalance(id: string) {
    try {
      const balanceDoc = await this.db.getUserBalance();
      if (balanceDoc) {
        this.balanceForm.setValue({
          _id: balanceDoc._id,
          _rev: balanceDoc._rev || '',
          balance: balanceDoc.balance,
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
      balance: ['', Validators.required],
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
  
    const balance = this.balanceForm.value;
  
    try {
      if (this.balanceId) {
        const existingBalance = await this.db.getBalanceById(this.balanceId);
  
        if (existingBalance && existingBalance._id) {  // ✅ Ensure balance exists
          await this.db.updateBalance(existingBalance._id, balance.amount, balance.source);
          await this.showToast('Balance Updated Successfully', 'success');
          console.log("Balance Updated");
        } else {
          await this.showToast('Balance not found', 'danger');
          console.error("Balance not found");
        }
      } else {
        await this.db.addBalance({
          amount: balance.amount,
          source: balance.source,
          dateAdded: new Date().toISOString(),
        });
  
        await this.showToast('Balance Added Successfully', 'success');
        console.log('Balance added successfully');
      }
  
      this.balanceForm.reset();
      this.navCtrl.navigateBack('/home'); // Adjust as needed
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
