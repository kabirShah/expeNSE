import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDebitPageRoutingModule } from './add-debit-routing.module';

import { AddDebitPage } from './add-debit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddDebitPageRoutingModule
  ],
  declarations: [AddDebitPage]
})
export class AddDebitPageModule {}
