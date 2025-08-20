import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HDFCPage } from './hdfc.page';

const routes: Routes = [
  {
    path: '',
    component: HDFCPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HDFCPageRoutingModule {}
