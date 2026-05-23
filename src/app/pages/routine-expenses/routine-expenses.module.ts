import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RoutineExpensesPageRoutingModule } from './routine-expenses-routing.module';
import { RoutineExpensesPage } from './routine-expenses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RoutineExpensesPageRoutingModule
  ],
  declarations: [RoutineExpensesPage]
})
export class RoutineExpensesPageModule {}
