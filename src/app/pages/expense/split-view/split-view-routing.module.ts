import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitViewPage } from './split-view.page';

const routes: Routes = [
  {
    path: '',
    component: SplitViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplitViewPageRoutingModule {}
