import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export type ToastTone = 'success' | 'danger' | 'warning' | 'primary' | 'medium';

@Injectable({
  providedIn: 'root'
})
export class UiToastService {
  constructor(private readonly toastCtrl: ToastController) {}

  async show(message: string, tone: ToastTone = 'primary', duration = 2600): Promise<void> {
    const isSuccess = tone === 'success';
    const isError = tone === 'danger';
    const cssClass = isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info';
    const icon = isSuccess ? 'checkmark-circle' : isError ? 'alert-circle' : 'information-circle';

    const toast = await this.toastCtrl.create({
      message,
      duration: isError ? Math.max(duration, 3600) : duration,
      position: 'top',
      icon,
      cssClass: ['toast-professional', cssClass],
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  async showSuccess(message: string): Promise<void> {
    await this.show(message, 'success', 3000);
  }

  async showError(message: string): Promise<void> {
    await this.show(message, 'danger', 4000);
  }
}
