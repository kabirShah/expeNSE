import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleViewExpensesPage } from './single-view-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: SingleViewExpensesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleViewExpensesPageRoutingModule {}
