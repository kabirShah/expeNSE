import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-add-debit',
    templateUrl: './add-debit.page.html',
    styleUrls: ['./add-debit.page.scss'],
    standalone: false
})
export class AddDebitPage implements OnInit {
  
  adddebitForm!: FormGroup;

  constructor(
    // private cardDb: CardService,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private fb:FormBuilder
  ) {
    this.adddebitForm = this.fb.group({
      userId: '12345', // Replace with dynamic user ID
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      debitLimit: 0,
    });
  }

  ngOnInit() {
    const cardId = this.route.snapshot.paramMap.get('id');
    this.loadCard(cardId);
  }
  async loadCard(cardId: string| null) {
    // if(cardId!== null){
    //   try {
    //     this.card = await this.cardDb.getdebitCardById(cardId);
    //   } catch (error) {
    //     this.showToast('Failed to load card details.');
    //     console.error(error);
    //   }
    // }else{
    //   console.log("Card ID is null");
    // }
    
  }
  async addCard() {
    const cardDetails = this.adddebitForm.value;
    try {
      console.log(cardDetails);
      this.router.navigateByUrl('/cards/debit');
      // await this.cardDb.adddebitCard(this.card);
      this.showToast('debit card added successfully!');
    } catch (error) {
      this.showToast('Failed to add debit card.');
      console.error(error);
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

}
