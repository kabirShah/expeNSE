import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SingleExpensePageRoutingModule } from './single-expense-routing.module';

import { SingleExpensePage } from './single-expense.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SingleExpensePageRoutingModule
  ],
  declarations: [SingleExpensePage]
})
export class SingleExpensePageModule {}
