import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplitPageRoutingModule } from './split-routing.module';

import { SplitPage } from './split.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitPageRoutingModule
  ],
  declarations: [SplitPage]
})
export class SplitPageModule {}
