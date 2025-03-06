import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReceiptPreviewPage } from './receipt-preview.page';

const routes: Routes = [
  {
    path: '',
    component: ReceiptPreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceiptPreviewPageRoutingModule {}
