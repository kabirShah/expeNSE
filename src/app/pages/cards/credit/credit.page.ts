import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { CreditCard } from 'src/app/models/credit-card.model';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.page.html',
  styleUrls: ['./credit.page.scss'],
})
export class CreditPage implements OnInit {
  creditCards: CreditCard[] = [];

  constructor(
    private db: DatabaseService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit() {
    await this.loadCreditCards();
  }

  async loadCreditCards() {
    try {
      this.creditCards = await this.db.getAllCreditCards(); // Fetch from database
    } catch (error) {
      console.error('Failed to load credit cards:', error);
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
  
    try {
      const success = await this.db.deleteCreditCard(cardId);
      if (success) {
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
