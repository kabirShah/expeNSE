import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../../pages/Admin-Panel/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'add-expense',
        loadChildren: () => import('../../pages/expense/add-expense/add-expense.module').then(m => m.AddExpensePageModule)
      },
      {
        path: 'view-expenses',
        loadChildren: () => import('../../pages/expense/view-expenses/view-expenses.module').then(m => m.ViewExpensesPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../../pages/setting/setting/setting.module').then(m => m.SettingPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
