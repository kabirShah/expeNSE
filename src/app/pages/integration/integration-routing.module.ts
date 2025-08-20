import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IntegrationPage } from './integration.page';

const routes: Routes = [
  {
    path: '',
    component: IntegrationPage
  },  {
    path: 'icici',
    loadChildren: () => import('./icici/icici.module').then( m => m.ICICIPageModule)
  },
  {
    path: 'axis',
    loadChildren: () => import('./axis/axis.module').then( m => m.AxisPageModule)
  },
  {
    path: 'sbi',
    loadChildren: () => import('./sbi/sbi.module').then( m => m.SBIPageModule)
  },
  {
    path: 'hdfc',
    loadChildren: () => import('./hdfc/hdfc.module').then( m => m.HDFCPageModule)
  },
  {
    path: 'kotak',
    loadChildren: () => import('./kotak/kotak.module').then( m => m.KotakPageModule)
  },
  {
    path: 'yes',
    loadChildren: () => import('./yes/yes.module').then( m => m.YesPageModule)
  },
  {
    path: 'rbl',
    loadChildren: () => import('./rbl/rbl.module').then( m => m.RBLPageModule)
  },
  {
    path: 'federal',
    loadChildren: () => import('./federal/federal.module').then( m => m.FederalPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegrationPageRoutingModule {}
