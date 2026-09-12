import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpensesPreviewPage } from './expenses-preview.page';

const routes: Routes = [
  {
    path: '',
    component: ExpensesPreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesPreviewPageRoutingModule {}
