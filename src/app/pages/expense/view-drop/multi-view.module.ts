import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiViewPageRoutingModule } from './multi-view-routing.module';

import { MultiViewPage } from './multi-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiViewPageRoutingModule
  ],
  declarations: [MultiViewPage]
})
export class MultiViewPageModule {}
