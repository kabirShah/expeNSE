import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitViewPage } from './split-view.page';

const routes: Routes = [
  {
    path: '',
    component: SplitViewPage
  },  {
    path: 'groups',
    loadChildren: () => import('./groups/groups.module').then( m => m.GroupsPageModule)
  },
  {
    path: 'group-add',
    loadChildren: () => import('./group-add/group-add.module').then( m => m.GroupAddPageModule)
  },
  {
    path: 'group-detail',
    loadChildren: () => import('./group-detail/group-detail.module').then( m => m.GroupDetailPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplitViewPageRoutingModule {}
