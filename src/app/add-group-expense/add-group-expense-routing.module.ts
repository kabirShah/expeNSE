import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddGroupExpensePage } from './add-group-expense.page';

const routes: Routes = [
  {
    path: '',
    component: AddGroupExpensePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddGroupExpensePageRoutingModule {}
