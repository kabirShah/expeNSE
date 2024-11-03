import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/Admin-Panel/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'add-expense',
    loadChildren: () => import('./pages/expense/add-expense/add-expense.module').then( m => m.AddExpensePageModule)
  },
  {
    path: 'view-expenses',
    loadChildren: () => import('./pages/expense/view-expenses/view-expenses.module').then( m => m.ViewExpensesPageModule)
  },
  {
    path: 'edit-expense',
    loadChildren: () => import('./pages/expense/edit-expense/edit-expense.module').then( m => m.EditExpensePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/setting/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/setting/registration/registration.module').then( m => m.RegistrationPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
