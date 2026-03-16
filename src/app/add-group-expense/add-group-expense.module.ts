import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddGroupExpensePageRoutingModule } from './add-group-expense-routing.module';

import { AddGroupExpensePage } from './add-group-expense.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddGroupExpensePageRoutingModule
  ],
  declarations: [AddGroupExpensePage]
})
export class AddGroupExpensePageModule {}
