import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ICICIPageRoutingModule } from './icici-routing.module';

import { ICICIPage } from './icici.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ICICIPageRoutingModule
  ],
  declarations: [ICICIPage]
})
export class ICICIPageModule {}
