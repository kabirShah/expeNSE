import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConnectBankPageRoutingModule } from './connect-bank-routing.module';
import { ConnectBankPage } from './connect-bank.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ConnectBankPageRoutingModule
  ],
  declarations: [ConnectBankPage]
})
export class ConnectBankPageModule {}
