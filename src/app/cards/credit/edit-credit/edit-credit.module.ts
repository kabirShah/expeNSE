import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditCreditPageRoutingModule } from './edit-credit-routing.module';

import { EditCreditPage } from './edit-credit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditCreditPageRoutingModule
  ],
  declarations: [EditCreditPage]
})
export class EditCreditPageModule {}
