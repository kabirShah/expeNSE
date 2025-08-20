import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KotakPageRoutingModule } from './kotak-routing.module';

import { KotakPage } from './kotak.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KotakPageRoutingModule
  ],
  declarations: [KotakPage]
})
export class KotakPageModule {}
