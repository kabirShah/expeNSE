import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDebitPageRoutingModule } from './add-debit-routing.module';

import { AddDebitPage } from './add-debit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AddDebitPageRoutingModule
  ],
  declarations: [AddDebitPage]
})
export class AddDebitPageModule {}
