import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesPreviewPageRoutingModule } from './expenses-preview-routing.module';

import { ExpensesPreviewPage } from './expenses-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpensesPreviewPageRoutingModule
  ],
  declarations: [ExpensesPreviewPage]
})
export class ExpensesPreviewPageModule {}
