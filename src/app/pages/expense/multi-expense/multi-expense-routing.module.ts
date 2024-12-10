import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiExpensePage } from './multi-expense.page';

const routes: Routes = [
  {
    path: '',
    component: MultiExpensePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiExpensePageRoutingModule {}
