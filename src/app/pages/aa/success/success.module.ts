import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SuccessPageRoutingModule } from './success-routing.module';
import { SuccessPage } from './success.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SuccessPageRoutingModule
  ],
  declarations: [SuccessPage]
})
export class SuccessPageModule {}
