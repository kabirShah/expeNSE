import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewDropPage } from './view-drop.page';

const routes: Routes = [
  {
    path: '',
    component: ViewDropPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewDropPageRoutingModule {}
