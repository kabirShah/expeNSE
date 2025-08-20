import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RBLPageRoutingModule } from './rbl-routing.module';

import { RBLPage } from './rbl.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RBLPageRoutingModule
  ],
  declarations: [RBLPage]
})
export class RBLPageModule {}
