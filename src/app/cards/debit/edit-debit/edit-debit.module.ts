import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditDebitPageRoutingModule } from './edit-debit-routing.module';

import { EditDebitPage } from './edit-debit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditDebitPageRoutingModule
  ],
  declarations: [EditDebitPage]
})
export class EditDebitPageModule {}
