import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReceiptDetailsPage } from './receipt-details.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ReceiptDetailsPage }]),
  ],
  declarations: [ReceiptDetailsPage],
})
export class ReceiptDetailsPageModule {}
