import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WebviewPageRoutingModule } from './webview-routing.module';
import { WebviewPage } from './webview.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    WebviewPageRoutingModule
  ],
  declarations: [WebviewPage]
})
export class WebviewPageModule {}
