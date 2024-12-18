import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddCreditPage } from './add-credit.page';

const routes: Routes = [
  {
    path: '',
    component: AddCreditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddCreditPageRoutingModule {}
