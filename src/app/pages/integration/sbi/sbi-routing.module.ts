import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SBIPage } from './sbi.page';

const routes: Routes = [
  {
    path: '',
    component: SBIPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SBIPageRoutingModule {}
