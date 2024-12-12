import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiViewPage } from './multi-view.page';

const routes: Routes = [
  {
    path: '',
    component: MultiViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiViewPageRoutingModule {}
