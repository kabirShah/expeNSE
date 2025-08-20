import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AxisPageRoutingModule } from './axis-routing.module';

import { AxisPage } from './axis.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AxisPageRoutingModule
  ],
  declarations: [AxisPage]
})
export class AxisPageModule {}
