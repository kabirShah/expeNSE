import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutineExpensesPage } from './routine-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: RoutineExpensesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutineExpensesPageRoutingModule {}
