import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HDFCPageRoutingModule } from './hdfc-routing.module';

import { HDFCPage } from './hdfc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HDFCPageRoutingModule
  ],
  declarations: [HDFCPage]
})
export class HDFCPageModule {}
