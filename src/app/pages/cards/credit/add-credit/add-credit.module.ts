import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCreditPageRoutingModule } from './add-credit-routing.module';

import { AddCreditPage } from './add-credit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddCreditPageRoutingModule
  ],
  declarations: [AddCreditPage]
})
export class AddCreditPageModule {}
