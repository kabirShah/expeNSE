import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RBLPage } from './rbl.page';

const routes: Routes = [
  {
    path: '',
    component: RBLPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RBLPageRoutingModule {}
