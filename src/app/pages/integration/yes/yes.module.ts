import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { YesPageRoutingModule } from './yes-routing.module';

import { YesPage } from './yes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    YesPageRoutingModule
  ],
  declarations: [YesPage]
})
export class YesPageModule {}
