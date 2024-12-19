import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiViewPage } from './multi-view.page';

const routes: Routes = [
  {
    path: '',
    component: MultiViewPage
  },
  {
    path:'multi-expense/:id',
    loadChildren:() => import('./multi-expense/multi-expense.module').then( m => m.MultiExpensePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiViewPageRoutingModule {}
