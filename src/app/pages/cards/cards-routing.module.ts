import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CardsPage } from './cards.page';

const routes: Routes = [
  {
    path: '',
    component: CardsPage
  },  {
    path: 'credit',
    loadChildren: () => import('./credit/credit.module').then( m => m.CreditPageModule)
  },
  {
    path: 'debit',
    loadChildren: () => import('./debit/debit.module').then( m => m.DebitPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CardsPageRoutingModule {}
