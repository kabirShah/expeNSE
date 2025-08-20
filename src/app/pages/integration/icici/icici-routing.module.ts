import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ICICIPage } from './icici.page';

const routes: Routes = [
  {
    path: '',
    component: ICICIPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ICICIPageRoutingModule {}
