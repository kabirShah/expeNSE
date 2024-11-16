import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewDropPageRoutingModule } from './view-drop-routing.module';

import { ViewDropPage } from './view-drop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewDropPageRoutingModule
  ],
  declarations: [ViewDropPage]
})
export class ViewDropPageModule {}
