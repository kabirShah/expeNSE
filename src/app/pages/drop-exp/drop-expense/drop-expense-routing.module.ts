import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DropExpensePage } from './drop-expense.page';

const routes: Routes = [
  {
    path: '',
    component: DropExpensePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DropExpensePageRoutingModule {}
