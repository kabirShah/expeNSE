import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { OnboardingGuard } from './onboarding.guard';

const protectedGuards = [AuthGuard, OnboardingGuard];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/setting/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/setting/registration/registration.module').then(m => m.RegistrationPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./pages/setting/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/Admin-Panel/home/home.module').then(m => m.HomePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'onboarding',
    loadChildren: () =>
      import('./pages/onboarding/onboarding.module').then(m => m.OnboardingPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/Admin-Panel/home/home.module').then(m => m.HomePageModule),
    canActivate: protectedGuards  
  },
  {
    path: 'balance',
    loadChildren: () =>
      import('./pages/expense/balance/balance.module').then(m => m.BalancePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'single-view-expenses',
    loadChildren: () =>
      import('./pages/expense/single-view-expenses/single-view-expenses.module').then(m => m.SingleViewExpensesPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./pages/expense/single-view-expenses/single-view-expenses.module').then(m => m.SingleViewExpensesPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'single-expense',
    loadChildren: () =>
      import('./pages/expense/single-view-expenses/single-expense/single-expense.module').then(m => m.SingleExpensePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'add-expense',
    loadChildren: () =>
      import('./pages/expense/single-view-expenses/single-expense/single-expense.module').then(m => m.SingleExpensePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'single-expense/:id',
    loadChildren: () =>
      import('./pages/expense/single-view-expenses/single-expense/single-expense.module').then(m => m.SingleExpensePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'multi-view-expense',
    loadChildren: () =>
      import('./pages/expense/multi-view-expenses/multi-view.module').then(m => m.MultiViewPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'multi-expense',
    loadChildren: () =>
      import('./pages/expense/multi-view-expenses/multi-expense/multi-expense.module').then(m => m.MultiExpensePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'multi-expense/:id',
    loadChildren: () =>
      import('./pages/expense/multi-view-expenses/multi-expense/multi-expense.module').then(m => m.MultiExpensePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'split',
    loadChildren: () =>
      import('./pages/expense/split-view/split/split.module').then(m => m.SplitPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'split-view',
    loadChildren: () =>
      import('./pages/expense/split-view/split-view.module').then(m => m.SplitViewPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'analytics',
    loadChildren: () =>
      import('./pages/analytics/analytics.module').then(m => m.AnalyticsPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./pages/reports/reports.module').then(m => m.ReportsPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'budget',
    loadChildren: () =>
      import('./pages/budget/budget.module').then(m => m.BudgetPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'voice-entry',
    loadChildren: () =>
      import('./pages/voice-entry/voice-entry.module').then(m => m.VoiceEntryPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'routine-expenses',
    loadChildren: () =>
      import('./pages/routine-expenses/routine-expenses.module').then(m => m.RoutineExpensesPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'scan',
    loadChildren: () =>
      import('./pages/scan/scan.module').then(m => m.ScanPageModule),
    canActivate: protectedGuards
  },


  {
    path: 'setting',
    loadChildren: () =>
      import('./pages/setting/setting/setting.module').then(m => m.SettingPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/setting/setting/setting.module').then(m => m.SettingPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./pages/setting/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'cards',
    loadChildren: () =>
      import('./pages/cards/cards.module').then(m => m.CardsPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'edit-credit',
    loadChildren: () =>
      import('./cards/credit/edit-credit/edit-credit.module').then(m => m.EditCreditPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'edit-debit',
    loadChildren: () =>
      import('./cards/debit/edit-debit/edit-debit.module').then(m => m.EditDebitPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'integration',
    loadChildren: () =>
      import('./pages/integration/integration.module').then(m => m.IntegrationPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () =>
      import('./pages/setting/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'groups',
    loadChildren: () =>
      import('./groups/groups.module').then(m => m.GroupsPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'group-dashboard',
    loadChildren: () =>
      import('./groups/groups.module').then(m => m.GroupsPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'groups/:id',
    loadChildren: () =>
      import('./group-detail/group-detail.module').then(m => m.GroupDetailPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'groups/:groupId/add-expense',
    loadChildren: () =>
      import('./add-group-expense/add-group-expense.module').then(m => m.AddGroupExpensePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'splitwise',
    loadChildren: () =>
      import('./pages/splitwise/splitwise.module').then(m => m.SplitwisePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'shared-finance',
    loadChildren: () =>
      import('./pages/shared-finance/shared-finance.module').then(m => m.SharedFinancePageModule),
    canActivate: protectedGuards
  },
  {
    path: 'aa/connect',
    loadChildren: () =>
      import('./pages/aa/connect-bank/connect-bank.module').then(m => m.ConnectBankPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'aa/webview',
    loadChildren: () =>
      import('./pages/aa/webview/webview.module').then(m => m.WebviewPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'aa/success',
    loadChildren: () =>
      import('./pages/aa/success/success.module').then(m => m.SuccessPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'aa/accounts',
    loadChildren: () =>
      import('./pages/aa/accounts/accounts.module').then(m => m.AccountsPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'aa/consent-status',
    loadChildren: () =>
      import('./pages/aa/consent-status/consent-status.module').then(m => m.ConsentStatusPageModule),
    canActivate: protectedGuards
  },
  {
    path: 'aa/transactions',
    loadChildren: () =>
      import('./pages/aa/transactions/transactions.module').then(m => m.TransactionsPageModule),
    canActivate: protectedGuards
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/notfound/notfound.module').then(m => m.NotfoundPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
