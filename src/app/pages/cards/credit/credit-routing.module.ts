import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditPage } from './credit.page';

const routes: Routes = [
  {
    path: '',
    component: CreditPage
  },
  {
    path: 'add-credit',
    loadChildren: () => import('./add-credit/add-credit.module').then( m => m.AddCreditPageModule)
  },
  {
    path: 'edit-credit/:id',
    loadChildren: () => import('../../../cards/credit/edit-credit/edit-credit.module').then( m => m.EditCreditPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditPageRoutingModule {}
