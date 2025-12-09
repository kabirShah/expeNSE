import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { BalanceService } from 'src/app/services/balance.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.page.html',
  styleUrls: ['./balance.page.scss'],
})
export class BalancePage implements OnInit {

  balanceForm!: FormGroup;
  balanceId: number | null = null;
  loading = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private balanceService: BalanceService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.createForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.balanceId = Number(id);
      this.isEdit = true;
      this.loadBalance(this.balanceId);
    }
  }

  createForm() {
    this.balanceForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      source: ['', Validators.required],
      date_added: ['', Validators.required]   // Mandatory by backend
    });
  }

  async loadBalance(id: number) {
    this.loading = true;
    try {
      const response = await this.balanceService.getBalanceById(id).toPromise();
      if (response?.success) {
        const b = response.data;

        this.balanceForm.patchValue({
          amount: b.amount,
          source: b.source,
          date_added: b.date_added ? b.date_added.substring(0, 10) : ''
        });
      }
    } catch (e) {
      this.showToast('Failed to load balance details', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async saveBalance() {
    if (this.balanceForm.invalid) {
      this.showToast('Please fill all required fields.', 'danger');
      return;
    }

    const form = this.balanceForm.value;
    this.loading = true;

    try {
      let response;

      if (this.isEdit) {
        response = await this.balanceService
          .updateBalance(this.balanceId!, form)
          .toPromise();
      } else {
        response = await this.balanceService
          .createBalance(form)
          .toPromise();
      }

      if (response?.success) {
        this.showToast(
          this.isEdit ? 'Balance updated successfully.' : 'Balance added successfully.',
          'success'
        );
        this.navCtrl.navigateBack('/home');
      } else {
        this.showToast('Operation failed.', 'danger');
      }
    } catch (err) {
      this.showToast('Error saving balance.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    toast.present();
  }
}
