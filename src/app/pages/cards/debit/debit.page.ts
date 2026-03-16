import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { DebitCard } from 'src/app/models/debit-card.model';
import { CardApiService } from 'src/app/services/card-api.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-debit',
  templateUrl: './debit.page.html',
  styleUrls: ['./debit.page.scss'],
})
export class DebitPage implements OnInit {

  debitCards: DebitCard[] = [];
  loading: boolean = false;

  constructor(
    private cardApiService: CardApiService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private uiToast: UiToastService,
  ) {}

  async ngOnInit() {
    await this.loadDebitCards();
  }

  async loadDebitCards() {
    this.loading = true;
    try {
      const response = await this.cardApiService.getDebitCards().toPromise();
      if (response?.success) {
        this.debitCards = response.data;
      } else {
        this.showToast('Failed to load debit cards', 'danger');
      }
    } catch (error) {
      console.error('Failed to load debit cards:', error);
      this.showToast('Failed to load debit cards', 'danger');
    } finally {
      this.loading = false;
    }
  }

  editCard(cardId: string) {
    this.navCtrl.navigateForward(`/cards/debit/edit/${cardId}`);
  }

  async deleteCard(cardId: string) {
    if (!cardId) {
      console.error('Invalid card ID');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this debit card?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              const response = await this.cardApiService.deleteDebitCard(cardId).toPromise();
              if (response?.success) {
                this.showToast('Debit card deleted successfully', 'success');
                this.loadDebitCards(); // Refresh the list after deletion
              } else {
                this.showToast('Failed to delete debit card', 'danger');
              }
            } catch (error) {
              console.error('Error deleting debit card:', error);
              this.showToast('Error deleting debit card', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }
  
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium') {
    await this.uiToast.show(message, color);
  }

}


