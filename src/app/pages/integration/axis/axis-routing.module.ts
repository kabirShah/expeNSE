import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AxisPage } from './axis.page';

const routes: Routes = [
  {
    path: '',
    component: AxisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AxisPageRoutingModule {}
