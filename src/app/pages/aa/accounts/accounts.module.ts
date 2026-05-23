import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AccountsPageRoutingModule } from './accounts-routing.module';
import { AccountsPage } from './accounts.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AccountsPageRoutingModule
  ],
  declarations: [AccountsPage]
})
export class AccountsPageModule {}
