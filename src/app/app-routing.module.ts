import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/setting/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/setting/registration/registration.module').then(m => m.RegistrationPageModule)
  },
  {
    path:'home',
    loadChildren:()=>import('./pages/Admin-Panel/home/home.module').then(m => m.HomePageModule)
  },
  {
    path:'balance',
    loadChildren: () => import('./pages/expense/balance/balance.module').then( m => m.BalancePageModule)
  },
  {
    path: 'single-expense',
    loadChildren: () => import('./pages/expense/single-view-expenses/single-expense/single-expense.module').then(m => m.SingleExpensePageModule)
  },
  {
    path: 'single-view-expenses',
    loadChildren: () => import('./pages/expense/single-view-expenses/single-view-expenses.module').then(m => m.SingleViewExpensesPageModule)
  },
  {
    path: 'multi-expense',
    loadChildren: () => import('./pages/expense/multi-view-expenses/multi-expense/multi-expense.module').then( m => m.MultiExpensePageModule)
  },
  {
    path: 'multi-view-expense',
    loadChildren: () => import('./pages/expense/multi-view-expenses/multi-view.module').then( m => m.MultiViewPageModule)
  },
  {
    path: 'split',
    loadChildren: () => import('./pages/expense/split-view/split/split.module').then( m => m.SplitPageModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./pages/analytics/analytics.module').then( m => m.AnalyticsPageModule)
  },
  {
    path:'setting',
    loadChildren: () => import('./pages/setting/setting/setting.module').then(m=>m.SettingPageModule)
  },
  {
    path:'profile',
    loadChildren: () => import('./pages/setting/profile/profile.module').then(m=>m.ProfilePageModule)
  },
  {
    path: 'split-view',
    loadChildren: () => import('./pages/expense/split-view/split-view.module').then( m => m.SplitViewPageModule)
  },
  {
    path: 'cards',
    loadChildren: () => import('./pages/cards/cards.module').then( m => m.CardsPageModule)
  },
  {
    path: 'scan',
    loadChildren: () => import('./pages/scan/scan.module').then( m => m.ScanPageModule)
  },
  {
    path: '**',
    loadChildren: () => import('./pages/notfound/notfound.module').then(m => m.NotfoundPageModule)
  }

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
