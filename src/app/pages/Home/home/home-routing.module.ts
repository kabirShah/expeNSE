import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes =[
  {
    path:'',
    component: HomePage
  }
  // {
  //   path: 'add-expense',
  //   loadChildren: () => import('../../expense/add-expense/add-expense.module').then(m => m.AddExpensePageModule)
  // },
  // {
  //   path: 'view-expenses',
  //   loadChildren: () => import('../../expense/view-expenses/view-expenses.module').then(m => m.ViewExpensesPageModule)
  // },
  // {
  //   path: 'drop-expense',
  //   loadChildren: () => import('../../drop-exp/drop-expense/drop-expense.module').then( m => m.DropExpensePageModule)
  // },
  // {
  //   path: 'view-drop',
  //   loadChildren: () => import('../../drop-exp/view-drop/view-drop.module').then( m => m.ViewDropPageModule)
  // },
  // {
  //   path: 'analytics',
  //   loadChildren: () => import('../../analytics/analytics.module').then( m => m.AnalyticsPageModule)
  // },
  // {
  //   path:'setting',
  //   loadChildren: () => import('../../setting/setting/setting.module').then(m=>m.SettingPageModule)
  // },
  // {
  //   path:'profile',
  //   loadChildren: () => import('../../setting/profile/profile.module').then(m=>m.ProfilePageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
