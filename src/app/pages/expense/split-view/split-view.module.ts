import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplitViewPageRoutingModule } from './split-view-routing.module';

import { SplitViewPage } from './split-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitViewPageRoutingModule
  ],
  declarations: [SplitViewPage]
})
export class SplitViewPageModule {}
