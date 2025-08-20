import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { YesPage } from './yes.page';

const routes: Routes = [
  {
    path: '',
    component: YesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YesPageRoutingModule {}
