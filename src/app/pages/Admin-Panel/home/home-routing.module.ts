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
  {
    path: 'drop-expense',
    loadChildren: () => import('../../../pages/drop-exp/drop-expense/drop-expense.module').then( m => m.DropExpensePageModule)
  },
  {
    path: 'view-drop',
    loadChildren: () => import('../../../pages/drop-exp/view-drop/view-drop.module').then( m => m.ViewDropPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
