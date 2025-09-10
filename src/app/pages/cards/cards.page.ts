import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { CardApiService } from 'src/app/services/card-api.service';
import { CreditCard } from 'src/app/models/credit-card.model';
import { DebitCard } from 'src/app/models/debit-card.model';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {

  creditCards: CreditCard[] = [];
  debitCards: DebitCard[] = [];
  allCards: any[] = [];
  filter: string = 'all'; // 'all', 'credit', 'debit'
  loading: boolean = false;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private cardApiService: CardApiService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadAllCards();
  }

  async loadAllCards() {
    this.loading = true;
    try {
      const [creditRes, debitRes] = await Promise.all([
        this.cardApiService.getCreditCards().toPromise(),
        this.cardApiService.getDebitCards().toPromise()
      ]);

      if (creditRes?.success) {
        this.creditCards = creditRes.data;
      }
      if (debitRes?.success) {
        this.debitCards = debitRes.data;
      }

      this.combineCards();
    } catch (error) {
      console.error('Error loading cards:', error);
      this.showToast('Failed to load cards', 'danger');
    } finally {
      this.loading = false;
    }
  }

  combineCards() {
    this.allCards = [
      ...this.creditCards.map(card => ({ ...card, type: 'credit' })),
      ...this.debitCards.map(card => ({ ...card, type: 'debit' }))
    ];
  }

  getFilteredCards() {
    if (this.filter === 'all') {
      return this.allCards;
    } else if (this.filter === 'credit') {
      return this.allCards.filter(card => card.type === 'credit');
    } else if (this.filter === 'debit') {
      return this.allCards.filter(card => card.type === 'debit');
    }
    return [];
  }

  setFilter(filter: string) {
    this.filter = filter;
  }

  async navigateToAddCreditCard(){
    await this.router.navigateByUrl('/cards/credit/add-credit');
  }
  async navigateToAddDebitCard(){
    await this.router.navigateByUrl('/cards/debit/add-debit');
  }
  async navigateToViewCredit(cardId?: string){
    if (cardId) {
      await this.router.navigateByUrl(`/cards/credit/edit/${cardId}`);
    } else {
      await this.router.navigateByUrl('/cards/credit');
    }
  }
  async navigateToViewDebit(cardId?: string){
    if (cardId) {
      await this.router.navigateByUrl(`/cards/debit/edit/${cardId}`);
    } else {
      await this.router.navigateByUrl('/cards/debit');
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
