import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes =[
  {
    path:'',
    component: HomePage
  },
  {
    path: 'add-expense',
    loadChildren: () => import('../../../pages/expense/add-expense/add-expense.module').then(m => m.AddExpensePageModule)
  },
  {
    path: 'view-expense',
    loadChildren: () => import('../../../pages/expense/view-expenses/view-expenses.module').then(m => m.ViewExpensesPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
