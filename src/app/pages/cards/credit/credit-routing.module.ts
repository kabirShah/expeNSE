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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditPageRoutingModule {}
