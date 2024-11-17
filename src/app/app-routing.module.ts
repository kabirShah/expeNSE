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
    path: 'add-expense',
    loadChildren: () => import('./pages/expense/add-expense/add-expense.module').then(m => m.AddExpensePageModule)
  },
  {
    path: 'view-expenses',
    loadChildren: () => import('./pages/expense/view-expenses/view-expenses.module').then(m => m.ViewExpensesPageModule)
  },
  {
    path:'home',
    loadChildren:()=>import('./pages/Admin-Panel/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'drop-expense',
    loadChildren: () => import('./pages/drop-exp/drop-expense/drop-expense.module').then( m => m.DropExpensePageModule)
  },
  {
    path: 'view-drop',
    loadChildren: () => import('./pages/drop-exp/view-drop/view-drop.module').then( m => m.ViewDropPageModule)
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
