import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCreditPageRoutingModule } from './add-credit-routing.module';

import { AddCreditPage } from './add-credit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddCreditPageRoutingModule
  ],
  declarations: [AddCreditPage]
})
export class AddCreditPageModule {}
