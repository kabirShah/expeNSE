import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { DebitCard } from 'src/app/models/debit-card.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-add-debit',
  templateUrl: './add-debit.page.html',
  styleUrls: ['./add-debit.page.scss'],
})
export class AddDebitPage implements OnInit {
  createdebitForm!: FormGroup;
  debitCardId: string | null = null;
  debitCard: DebitCard | null = null;

  constructor(
    private db: DatabaseService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createdebitForm = this.fb.group({
      userId: ['12345'], // Replace with dynamic user ID
      cardNumber: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(19)]],
      cardHolderName: ['', Validators.required],
      expiryDate: ['', Validators.required],
      debitLimit: [0, Validators.min(0)],
    });

    this.debitCardId = this.route.snapshot.paramMap.get('id');
    if (this.debitCardId) {
      this.loadCard(this.debitCardId);
    }
  }

  async loadCard(cardId: string | null) {
    if (cardId !== null) {
      try {
        const card = await this.db.getDebitCard(cardId);
        this.debitCard = card ?? null; // Ensure null is assigned if undefined
      } catch (error) {
        this.showToast('Failed to load card details.', 'danger');
        console.error(error);
        this.debitCard = null; // Handle error case by setting to null
      }
    } else {
      console.log('Card ID is null');
      this.debitCard = null;
    }
  }
  
  

  async addCard() {
    if (this.createdebitForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please fill in all required fields!', 'danger');
      return;
    }

    const cardDetails = this.createdebitForm.value;
    try {
      if (this.debitCardId) {
        // Update existing card
        if (this.debitCard) {
          cardDetails._id = this.debitCard._id;
          cardDetails._rev = this.debitCard._rev;
          await this.db.updateDebitCard(cardDetails);
          await this.showToast('Debit Card Updated Successfully', 'success');
        } else {
          await this.showToast('Debit Card not found', 'danger');
        }
      } else {
        // Add new card
        await this.db.addDebitCard(cardDetails);
        await this.showToast('Debit Card Added Successfully', 'success');
      }

      this.createdebitForm.reset();
      this.navCtrl.navigateBack('/cards/debit');
    } catch (error) {
      this.showToast('Failed to add/update debit card.', 'danger');
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
