import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { CreditCard } from '../../../../models/credit-card.model';
import { CardApiService } from 'src/app/services/card-api.service';

@Component({
  selector: 'app-add-credit',
  templateUrl: './add-credit.page.html',
  styleUrls: ['./add-credit.page.scss'],
})
export class AddCreditPage implements OnInit {
  createCreditForm!: FormGroup;
  creditCardId: string | null = null;
  creditCard: CreditCard | null = null;
  loading: boolean = false;

  constructor(
    private cardApiService: CardApiService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createCreditForm = this.fb.group({
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
      this.loading = true;
      try {
        const response = await this.cardApiService.getCreditCardById(cardId).toPromise();
        if (response?.success) {
          this.creditCard = response.data;
          // Populate form with existing data
          this.createCreditForm.patchValue({
            cardNumber: this.creditCard.cardNumber,
            cardHolderName: this.creditCard.cardHolderName,
            expiryDate: this.creditCard.expiryDate,
            creditLimit: this.creditCard.creditLimit
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
    if (this.createCreditForm.invalid) {
      console.error('Form is invalid');
      await this.showToast('Please fill in all required fields!', 'danger');
      return;
    }

    const cardDetails = this.createCreditForm.value;
    this.loading = true;
    
    try {
      if (this.creditCardId && this.creditCard) {
        // Update existing card
        const updatedCard = { ...this.creditCard, ...cardDetails };
        const response = await this.cardApiService.updateCreditCard(this.creditCardId, updatedCard).toPromise();
        
        if (response?.success) {
          await this.showToast('Credit Card Updated Successfully', 'success');
        } else {
          await this.showToast('Failed to update credit card', 'danger');
        }
      } else {
        // Add new card
        const response = await this.cardApiService.createCreditCard(cardDetails).toPromise();
        if (response?.success) {
          await this.showToast('Credit Card Added Successfully', 'success');
        } else {
          await this.showToast('Failed to add credit card', 'danger');
        }
      }

      this.createCreditForm.reset();
      this.navCtrl.navigateBack('/cards/credit');
    } catch (error) {
      this.showToast('Failed to add/update credit card.', 'danger');
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
