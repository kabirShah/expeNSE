import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {

  creditCards: any[] = [];
  constructor(private router:Router, 
    private cardService: CardService,
    private navCtrl: NavController
  ) {   }

  ngOnInit() {
    this.loadCards();
  }
  async loadCards() {
    this.creditCards = await this.cardService.getAllCards('credit');
  }
  async navigateToAddCreditCard(){
    await this.router.navigateByUrl('/cards/credit/add-credit');
  }
  async navigateToAddDebitCard(){
    await this.router.navigateByUrl('/cards/debit/add-debit');
  }
}
