import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewExpensesPageRoutingModule } from './view-expenses-routing.module';

import { ViewExpensesPage } from './view-expenses.page';
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewExpensesPageRoutingModule,
    IonicStorageModule.forRoot(),
  ],
  declarations: [ViewExpensesPage]
})
export class ViewExpensesPageModule {}
