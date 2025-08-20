import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SBIPageRoutingModule } from './sbi-routing.module';

import { SBIPage } from './sbi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SBIPageRoutingModule
  ],
  declarations: [SBIPage]
})
export class SBIPageModule {}
