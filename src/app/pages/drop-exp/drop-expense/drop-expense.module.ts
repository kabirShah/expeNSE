import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DropExpensePageRoutingModule } from './drop-expense-routing.module';

import { DropExpensePage } from './drop-expense.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DropExpensePageRoutingModule
  ],
  declarations: [DropExpensePage]
})
export class DropExpensePageModule {}
