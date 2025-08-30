import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { BalanceService } from 'src/app/services/balance.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.page.html',
})
export class BalancePage implements OnInit {
  balanceForm!: FormGroup;
  balanceId: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private balanceService: BalanceService,
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
    this.loading = true;
    try {
      const response = await this.balanceService.getBalanceById(id).toPromise();
      if (response?.success) {
        const balanceDoc = response.data;
        this.balanceForm.patchValue({
          amount: balanceDoc.amount,
          source: balanceDoc.source || '', // Load source if available
        });
      } else {
        this.showToast('Failed to load balance details', 'danger');
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      this.showToast('Failed to load balance details', 'danger');
    } finally {
      this.loading = false;
    }
  }

  // Create form with balance and source fields
  createForm() {
    this.balanceForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
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
    this.loading = true;

    try {
      if (this.balanceId) {
        // Update existing balance
        const response = await this.balanceService.updateBalance(this.balanceId, balanceData).toPromise();
        if (response?.success) {
          await this.showToast('Balance Updated Successfully', 'success');
          console.log("Balance Updated");
        } else {
          await this.showToast('Failed to update balance', 'danger');
          console.error("Failed to update balance");
        }
      } else {
        // Add new balance
        const response = await this.balanceService.createBalance({
          ...balanceData,
          dateAdded: new Date().toISOString(),
        }).toPromise();

        if (response?.success) {
          await this.showToast('Balance Added Successfully', 'success');
          console.log('Balance added successfully');
        } else {
          await this.showToast('Failed to add balance', 'danger');
        }
      }

      this.balanceForm.reset();
      this.navCtrl.navigateBack('/home'); // 🔥 Redirect correctly
    } catch (error) {
      console.error('Error saving balance', error);
      this.showToast('Error saving balance', 'danger');
    } finally {
      this.loading = false;
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
