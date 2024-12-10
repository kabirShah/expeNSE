import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiExpensePageRoutingModule } from './multi-expense-routing.module';

import { MultiExpensePage } from './multi-expense.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MultiExpensePageRoutingModule
  ],
  declarations: [MultiExpensePage]
})
export class MultiExpensePageModule {}
