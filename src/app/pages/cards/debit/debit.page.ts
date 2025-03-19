import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { DebitCard } from 'src/app/models/debit-card.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-debit',
  templateUrl: './debit.page.html',
  styleUrls: ['./debit.page.scss'],
})
export class DebitPage implements OnInit {

  debitCards: DebitCard[] = [];

  constructor(
    private db: DatabaseService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit() {
    await this.loadDebitCards();
  }

  async loadDebitCards() {
    try {
      this.debitCards = await this.db.getAllDebitCards(); // Fetch from database
    } catch (error) {
      console.error('Failed to load Debit cards:', error);
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
  
    try {
      const success = await this.db.deleteDebitCard(cardId);
      if (success) {
        this.showToast('Debit card deleted successfully', 'success');
        this.loadDebitCards(); // Refresh the list after deletion
      } else {
        this.showToast('Failed to delete Debit card', 'danger');
      }
    } catch (error) {
      console.error('Error deleting Debit card:', error);
      this.showToast('Error deleting Debit card', 'danger');
    }
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
