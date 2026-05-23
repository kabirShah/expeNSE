import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedFinancePage } from './shared-finance.page';

const routes: Routes = [
  {
    path: '',
    component: SharedFinancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedFinancePageRoutingModule {}
