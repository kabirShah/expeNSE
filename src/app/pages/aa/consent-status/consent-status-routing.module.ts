import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsentStatusPage } from './consent-status.page';

const routes: Routes = [
  {
    path: '',
    component: ConsentStatusPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsentStatusRoutingModule {}