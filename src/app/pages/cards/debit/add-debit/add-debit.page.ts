import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { DebitCard } from 'src/app/models/debit-card.model';
import { CardApiService } from 'src/app/services/card-api.service';

@Component({
  selector: 'app-add-debit',
  templateUrl: './add-debit.page.html',
  styleUrls: ['./add-debit.page.scss'],
})
export class AddDebitPage implements OnInit {
  createdebitForm!: FormGroup;
  debitCardId: string | null = null;
  debitCard: DebitCard | null = null;
  loading: boolean = false;

  constructor(
    private cardApiService: CardApiService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createdebitForm = this.fb.group({
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
      this.loading = true;
      try {
        const response = await this.cardApiService.getDebitCardById(cardId).toPromise();
        if (response?.success) {
          this.debitCard = response.data;
          // Populate form with existing data
          this.createdebitForm.patchValue({
            cardNumber: this.debitCard.cardNumber,
            cardHolderName: this.debitCard.cardHolderName,
            expiryDate: this.debitCard.expiryDate,
            debitLimit: this.debitCard.debitLimit
          });
        } else {
          this.showToast('Failed to load card details.', 'danger');
        }
      } catch (error) {
        this.showToast('Failed to load card details.', 'danger');
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  }
  
  async addCard() {
    if (this.createdebitForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please fill in all required fields!', 'danger');
      return;
    }

    const cardDetails = this.createdebitForm.value;
    this.loading = true;
    
    try {
      if (this.debitCardId && this.debitCard) {
        // Update existing card
        const updatedCard = { ...this.debitCard, ...cardDetails };
        const response = await this.cardApiService.updateDebitCard(this.debitCardId, updatedCard).toPromise();
        
        if (response?.success) {
          await this.showToast('Debit Card Updated Successfully', 'success');
        } else {
          await this.showToast('Failed to update debit card', 'danger');
        }
      } else {
        // Add new card
        const response = await this.cardApiService.createDebitCard(cardDetails).toPromise();
        if (response?.success) {
          await this.showToast('Debit Card Added Successfully', 'success');
        } else {
          await this.showToast('Failed to add debit card', 'danger');
        }
      }

      this.createdebitForm.reset();
      this.navCtrl.navigateBack('/cards/debit');
    } catch (error) {
      this.showToast('Failed to add/update debit card.', 'danger');
      console.error(error);
    } finally {
      this.loading = false;
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
