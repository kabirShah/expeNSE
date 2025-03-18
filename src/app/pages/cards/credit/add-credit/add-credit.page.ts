import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { CreditCard } from '../../../../models/credit-card.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.page.html',
  styleUrls: ['./add-credit.page.scss'],
})
export class AddCreditPage implements OnInit {
  createCreditForm!: FormGroup;
  creditCardId: string | null = null;
  creditCard: CreditCard | null = null;

  constructor(
    private db: DatabaseService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createCreditForm = this.fb.group({
      userId: ['12345'], // Replace with dynamic user ID
      cardNumber: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(19)]],
      cardHolderName: ['', Validators.required],
      expiryDate: ['', Validators.required],
      creditLimit: [0, Validators.min(0)],
    });

    this.creditCardId = this.route.snapshot.paramMap.get('id');
    if (this.creditCardId) {
      this.loadCard(this.creditCardId);
    }
  }

  async loadCard(cardId: string | null) {
    if (cardId !== null) {
      try {
        const card = await this.db.getCreditCard(cardId);
        this.creditCard = card ?? null; // Ensure null is assigned if undefined
      } catch (error) {
        this.showToast('Failed to load card details.', 'danger');
        console.error(error);
        this.creditCard = null; // Handle error case by setting to null
      }
    } else {
      console.log('Card ID is null');
      this.creditCard = null;
    }
  }
  
  

  async addCard() {
    if (this.createCreditForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please fill in all required fields!', 'danger');
      return;
    }

    const cardDetails = this.createCreditForm.value;
    try {
      if (this.creditCardId) {
        // Update existing card
        if (this.creditCard) {
          cardDetails._id = this.creditCard._id;
          cardDetails._rev = this.creditCard._rev;
          await this.db.updateCreditCard(cardDetails);
          await this.showToast('Credit Card Updated Successfully', 'success');
        } else {
          await this.showToast('Credit Card not found', 'danger');
        }
      } else {
        // Add new card
        await this.db.addCreditCard(cardDetails);
        await this.showToast('Credit Card Added Successfully', 'success');
      }

      this.createCreditForm.reset();
      this.navCtrl.navigateBack('/cards/credit');
    } catch (error) {
      this.showToast('Failed to add/update credit card.', 'danger');
      console.error(error);
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
