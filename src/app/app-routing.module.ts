import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

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
    loadChildren:()=>import('./pages/Admin-Panel/home/home.module').then(m => m.HomePageModule), canActivate: [AuthGuard]
  },
  {
    path:'balance',
    loadChildren: () => import('./pages/expense/balance/balance.module').then( m => m.BalancePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'single-expense',
    loadChildren: () => import('./pages/expense/single-view-expenses/single-expense/single-expense.module').then(m => m.SingleExpensePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'single-view-expenses',
    loadChildren: () => import('./pages/expense/single-view-expenses/single-view-expenses.module').then(m => m.SingleViewExpensesPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'single-expense/:id',
    loadChildren: () => import('./pages/expense/single-view-expenses/single-expense/single-expense.module').then(m => m.SingleExpensePageModule), canActivate:[AuthGuard]
  },
  {
    path: 'multi-expense',
    loadChildren: () => import('./pages/expense/multi-view-expenses/multi-expense/multi-expense.module').then( m => m.MultiExpensePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'multi-expense/:id',
    loadChildren: () => import('./pages/expense/multi-view-expenses/multi-expense/multi-expense.module').then(m => m.MultiExpensePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'multi-view-expense',
    loadChildren: () => import('./pages/expense/multi-view-expenses/multi-view.module').then( m => m.MultiViewPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'split',
    loadChildren: () => import('./pages/expense/split-view/split/split.module').then( m => m.SplitPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    loadChildren: () => import('./pages/analytics/analytics.module').then( m => m.AnalyticsPageModule), canActivate: [AuthGuard]
  },
  {
    path:'setting',
    loadChildren: () => import('./pages/setting/setting/setting.module').then(m=>m.SettingPageModule), canActivate: [AuthGuard]
  },
  {
    path:'profile',
    loadChildren: () => import('./pages/setting/profile/profile.module').then(m=>m.ProfilePageModule), canActivate: [AuthGuard]
  },
  {
    path: 'split-view',
    loadChildren: () => import('./pages/expense/split-view/split-view.module').then( m => m.SplitViewPageModule), canActivate: [AuthGuard]
  },
  //  { path: 'groups', loadChildren: () => import('./pages/expense/split-view/groups/groups.module').then(m => m.GroupsPageModule) },
  // { path: 'group-add', loadChildren: () => import('./pages/expense/split-view/group-add/group-add.module').then(m => m.GroupAddPageModule) },
  // { path: 'group/:id', loadChildren: () => import('./pages/expense/split-view/group-detail/group-detail.module').then(m => m.GroupDetailPageModule) },
  {
    path: 'cards',
    loadChildren: () => import('./pages/cards/cards.module').then( m => m.CardsPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'scan',
    loadChildren: () => import('./pages/scan/scan.module').then( m => m.ScanPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'integration',
    loadChildren: () => import('./pages/integration/integration.module').then( m => m.IntegrationPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/setting/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: '**',
    loadChildren: () => import('./pages/notfound/notfound.module').then(m => m.NotfoundPageModule)
  },
  {
    path: 'edit-credit',
    loadChildren: () => import('./cards/credit/edit-credit/edit-credit.module').then( m => m.EditCreditPageModule)
  },
  {
    path: 'edit-debit',
    loadChildren: () => import('./cards/debit/edit-debit/edit-debit.module').then( m => m.EditDebitPageModule)
  }



];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
