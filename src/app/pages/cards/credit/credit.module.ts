import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditPageRoutingModule } from './credit-routing.module';

import { CreditPage } from './credit.page';
import { CardService } from 'src/app/services/card.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditPageRoutingModule
  ],
  providers:[CardService],
  declarations: [CreditPage]
})
export class CreditPageModule {}
