import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';


@Component({
  selector: 'app-balance',
  templateUrl: './balance.page.html',
})
export class BalancePage  {
  balanceForm!: FormGroup;
  BalanceId: string | null = null;

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
    console.log(this.BalanceId);
    if (this.BalanceId) {
      this.loadBalance(this.BalanceId);
    }
  }

  // Loading balance details (for update)
  async loadBalance(id: string) {
    try {
      const balanceDoc = await this.db.getUserBalance();
      if (balanceDoc) {
        this.balanceForm.setValue({
          _id: balanceDoc._id,  // Set the document ID
          _rev: balanceDoc._rev || '',  // Set the revision for updates (if available)
          balance: balanceDoc.balance,  // Set the balance amount
        });
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      // Handle any error if balance is not found
    }
  }
  
  

  // Create the form for balance input
  createForm() {
    this.balanceForm = this.fb.group({
      _id: [''],
      balance: ['', Validators.required],
    });
  }

  // Save balance (Add or Update)
  async saveBalance() {
    const balance = this.balanceForm.value;
    console.log(balance);
    
    // Ensure the balance object has the required structure before saving
      await this.db.saveBalance(balance); // Use the saveBalance method from DatabaseService
      await this.showToast('Balance Added/Updated Successfully', 'success');
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
