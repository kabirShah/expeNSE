import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceiptPreviewPageRoutingModule } from './receipt-preview-routing.module';

import { ReceiptPreviewPage } from './receipt-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReceiptPreviewPageRoutingModule
  ],
  declarations: [ReceiptPreviewPage]
})
export class ReceiptPreviewPageModule {}
