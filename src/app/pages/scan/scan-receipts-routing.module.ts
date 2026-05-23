import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScanReceiptsPage } from './scan-receipts.page';

const routes: Routes = [
  {
    path: '',
    component: ScanReceiptsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanReceiptsPageRoutingModule {}

