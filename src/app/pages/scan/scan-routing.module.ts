import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScanPage } from './scan.page';

const routes: Routes = [
  {
    path: '',
    component: ScanPage
  },  {
    path: 'receipt-preview',
    loadChildren: () => import('./receipt-preview/receipt-preview.module').then( m => m.ReceiptPreviewPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanPageRoutingModule {}
