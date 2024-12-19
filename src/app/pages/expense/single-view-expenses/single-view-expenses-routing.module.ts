import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleViewExpensesPage } from './single-view-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: SingleViewExpensesPage
  },
  {
    path: 'single-expense/:id',
    loadChildren: () => import('./single-expense/single-expense.module').then(m => m.SingleExpensePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleViewExpensesPageRoutingModule {}
