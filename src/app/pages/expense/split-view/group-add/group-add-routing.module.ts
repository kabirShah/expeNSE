import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupAddPage } from './group-add.page';

const routes: Routes = [
  {
    path: '',
    component: GroupAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupAddPageRoutingModule {}
