import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KotakPage } from './kotak.page';

const routes: Routes = [
  {
    path: '',
    component: KotakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KotakPageRoutingModule {}
