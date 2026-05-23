import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SplitwisePageRoutingModule } from './splitwise-routing.module';
import { SplitwisePage } from './splitwise.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitwisePageRoutingModule,
  ],
  declarations: [SplitwisePage]
})
export class SplitwisePageModule {}
