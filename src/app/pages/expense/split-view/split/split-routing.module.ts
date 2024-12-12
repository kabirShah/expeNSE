import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitPage } from './split.page';

const routes: Routes = [
  {
    path: '',
    component: SplitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplitPageRoutingModule {}
