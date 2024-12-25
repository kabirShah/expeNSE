import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { CreditCard } from '../../../../models/credit-card.model';
import { CardService } from '../../../../services/card.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.page.html',
  styleUrls: ['./add-credit.page.scss'],
})
export class AddCreditPage implements OnInit{
  createCreditForm!: FormGroup;
  creditCardId: string | null = null;
  CreditCard;
  constructor(
    private db: DatabaseService,
    private toastCtrl: ToastController,
    private navCtrl:NavController,
    private route: ActivatedRoute,
    private router: Router,
    private fb:FormBuilder
  ) {
    this.createCreditForm = this.fb.group({
      userId: '12345', // Replace with dynamic user ID
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      creditLimit: 0,
    });
  }

  ngOnInit() {
    const cardId = this.route.snapshot.paramMap.get('id');
    this.loadCard(cardId);
  }
  async loadCard(cardId: string| null) {
    // if(cardId!== null){
    //   try {
    //     this.card = await this.cardDb.getCreditCardById(cardId);
    //   } catch (error) {
    //     this.showToast('Failed to load card details.');
    //     console.error(error);
    //   }
    // }else{
    //   console.log("Card ID is null");
    // }
    
  }
  async addCard() {
    if (this.createCreditForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please enter a valid expense!','danger');
      return;
    }
    const cardDetails = this.createCreditForm.value;
    try {
      if(this.creditCardId){
        const existingCards = await this.db.getCards(this.creditCardId);
        if (existingCards) {  // Type Guard Check
          cardDetails._id = existingCards._id;
          cardDetails._rev = existingCards._rev;
          await this.db.updateCards(cardDetails);
          await this.showToast('Credit Card Updated Successfully','success');
          console.log("Credit Card Updated");
        } else {
          await this.showToast('Credit Card not found','danger');
          console.error("Credit Card not found");
        }
      } else {
        delete cardDetails._rev;
        await this.db.addCreditCard(cardDetails);
        await this.showToast('Credit Card Added Successfully','success');
        console.log('Credit Card added successfully');
      }
      this.createCreditForm.reset();
      this.navCtrl.navigateBack('/cards/credit');
    } catch (error) {
      this.showToast('Failed to add credit card.','danger');
      console.error(error);
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

}
