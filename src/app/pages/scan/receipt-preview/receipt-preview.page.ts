import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.page.html',
  styleUrls: ['./receipt-preview.page.scss'],
})
export class ReceiptPreviewPage {
  @Input() receipt: any;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
