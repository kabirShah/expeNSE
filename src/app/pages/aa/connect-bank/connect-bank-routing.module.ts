import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectBankPage } from './connect-bank.page';

const routes: Routes = [
  {
    path: '',
    component: ConnectBankPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConnectBankPageRoutingModule {}
