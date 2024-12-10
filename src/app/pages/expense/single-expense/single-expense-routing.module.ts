import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleExpensePage } from './single-expense.page';

const routes: Routes = [
  {
    path: '',
    component: SingleExpensePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleExpensePageRoutingModule {}
