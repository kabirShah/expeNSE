import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditDebitPage } from './edit-debit.page';

const routes: Routes = [
  {
    path: '',
    component: EditDebitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditDebitPageRoutingModule {}
