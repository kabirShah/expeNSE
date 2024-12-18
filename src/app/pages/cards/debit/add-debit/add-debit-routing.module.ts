import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddDebitPage } from './add-debit.page';

const routes: Routes = [
  {
    path: '',
    component: AddDebitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDebitPageRoutingModule {}
