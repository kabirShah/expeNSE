import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BalanceService } from 'src/app/services/balance.service';
import { Balance } from 'src/app/models/balance.model';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.page.html',
  styleUrls: ['./balance.page.scss'],
})
export class BalancePage implements OnInit {

  balanceForm!: FormGroup;
  balances: Balance[] = [];
  balanceId: number | null = null;
  loading = false;
  loadingList = false;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private balanceService: BalanceService,
    private route: ActivatedRoute,
    private uiToast: UiToastService,
    private alertCtrl: AlertController,
    private mockNotificationService: MockNotificationService
  ) {}

  ngOnInit() {
    this.createForm();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.balanceId = Number(id);
      this.isEdit = true;
      this.loadBalance(this.balanceId);
    }

    this.loadBalances();
  }

  createForm() {
    this.balanceForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      source: ['', Validators.required],
      date_added: ['', Validators.required]
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  async loadBalances() {
    this.loadingList = true;

    try {
      const response = await firstValueFrom(this.balanceService.getBalances());
      this.balances = response?.success ? (response.data || []) : [];
    } catch {
      this.showToast('Failed to load balances.', 'danger');
    } finally {
      this.loadingList = false;
    }
  }

  async loadBalance(id: number) {
    this.loading = true;

    try {
      const response = await firstValueFrom(this.balanceService.getBalanceById(id));

      if (response?.success) {
        const b: Balance = response.data;
        this.patchForm(b);
      }
    } catch {
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

    const formData: Partial<Balance> = this.balanceForm.value;

    this.loading = true;

    try {
      const response = this.isEdit && this.balanceId
        ? await firstValueFrom(this.balanceService.updateBalance(this.balanceId, formData))
        : await firstValueFrom(this.balanceService.createBalance(formData));

      if (response?.success) {
        this.mockNotificationService.addCrudNotification(
          'Balance',
          this.isEdit ? 'updated' : 'created',
          `${formData.source || 'Balance entry'} • ₹${formData.amount || 0}`
        );

        this.showToast(
          this.isEdit ? 'Balance updated successfully.' : 'Balance added successfully.',
          'success'
        );

        this.resetFormState();
        await this.loadBalances();
      } else {
        this.showToast('Operation failed.', 'danger');
      }
    } catch {
      this.showToast('Error saving balance.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  startEdit(balance: Balance) {
    this.isEdit = true;
    this.balanceId = balance.id;
    this.patchForm(balance);
  }

  cancelEdit() {
    this.resetFormState();
  }

  async confirmDelete(id?: number) {
    const targetId = id ?? this.balanceId;
    if (!targetId) return;

    const alert = await this.alertCtrl.create({
      header: 'Delete balance?',
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteBalance(targetId);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteBalance(id: number) {
    this.loading = true;
    const deletingItem = this.balances.find((item) => item.id === id);

    try {
      const response = await firstValueFrom(this.balanceService.deleteBalance(id));

      if (response?.success) {
        this.mockNotificationService.addCrudNotification(
          'Balance',
          'deleted',
          `${deletingItem?.source || 'Balance entry'} was deleted.`
        );

        this.showToast('Balance deleted successfully.', 'success');

        if (this.balanceId === id) {
          this.resetFormState();
        }

        await this.loadBalances();
      } else {
        this.showToast('Delete failed.', 'danger');
      }
    } catch {
      this.showToast('Error deleting balance.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  get editingBalance(): Balance | null {
    if (!this.balanceId) return null;
    return this.balances.find(item => item.id === this.balanceId) || null;
  }

  trackByBalanceId(_: number, item: Balance): number {
    return item.id;
  }

  private patchForm(balance: Balance) {
    this.balanceForm.patchValue({
      amount: balance.amount,
      source: balance.source,
      date_added: this.toDateInputValue(balance.date_added)
    });
  }

  private resetFormState() {
    this.balanceForm.reset();
    this.isEdit = false;
    this.balanceId = null;
  }

  private toDateInputValue(value: string | null | undefined): string {
    if (!value) return '';
    return value.substring(0, 10);
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium') {
    await this.uiToast.show(message, color);
  }

}


