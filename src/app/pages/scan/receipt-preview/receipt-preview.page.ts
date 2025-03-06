import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.page.html',
  styleUrls: ['./receipt-preview.page.scss'],
})
export class ReceiptPreviewPage implements OnInit {
  @Input() imageUrl!: string; // Get the image URL from parent page

  constructor(private modalCtrl: ModalController) {

   }

  ngOnInit() {

  }
  closeModal() {
    this.modalCtrl.dismiss(); // Close the modal
  }


}
