import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { CardApiService } from 'src/app/services/card-api.service';
import { CreditCard } from 'src/app/models/credit-card.model';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.page.html',
  styleUrls: ['./credit.page.scss'],
})
export class CreditPage implements OnInit {
  creditCards: CreditCard[] = [];
  loading: boolean = false;

  constructor(
    private cardApiService: CardApiService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit() {
    await this.loadCreditCards();
  }

  async loadCreditCards() {
    this.loading = true;
    try {
      const response = await this.cardApiService.getCreditCards().toPromise();
      if (response?.success) {
        this.creditCards = response.data;
      } else {
        this.showToast('Failed to load credit cards', 'danger');
      }
    } catch (error) {
      console.error('Failed to load credit cards:', error);
      this.showToast('Failed to load credit cards', 'danger');
    } finally {
      this.loading = false;
    }
  }

  editCard(cardId: string) {
    this.navCtrl.navigateForward(`/cards/credit/edit/${cardId}`);
  }

  async deleteCard(cardId: string) {
    if (!cardId) {
      console.error('Invalid card ID');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this credit card?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              const response = await this.cardApiService.deleteCreditCard(cardId).toPromise();
              if (response?.success) {
                this.showToast('Credit card deleted successfully', 'success');
                this.loadCreditCards(); // Refresh the list after deletion
              } else {
                this.showToast('Failed to delete credit card', 'danger');
              }
            } catch (error) {
              console.error('Error deleting credit card:', error);
              this.showToast('Error deleting credit card', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }
  
  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
