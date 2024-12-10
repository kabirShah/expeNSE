import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SingleViewExpensesPageRoutingModule } from './single-view-expenses-routing.module';

import { SingleViewExpensesPage } from './single-view-expenses.page';
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SingleViewExpensesPageRoutingModule,
    IonicStorageModule.forRoot(),
  ],
  declarations: [SingleViewExpensesPage]
})
export class SingleViewExpensesPageModule {}
