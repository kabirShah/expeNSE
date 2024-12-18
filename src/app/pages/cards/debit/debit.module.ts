import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DebitPageRoutingModule } from './debit-routing.module';

import { DebitPage } from './debit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DebitPageRoutingModule
  ],
  declarations: [DebitPage]
})
export class DebitPageModule {}
