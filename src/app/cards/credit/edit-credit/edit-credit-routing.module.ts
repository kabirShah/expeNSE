import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditCreditPage } from './edit-credit.page';

const routes: Routes = [
  {
    path: '',
    component: EditCreditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditCreditPageRoutingModule {}
