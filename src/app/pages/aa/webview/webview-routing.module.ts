import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebviewPage } from './webview.page';

const routes: Routes = [
  {
    path: '',
    component: WebviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebviewPageRoutingModule {}
