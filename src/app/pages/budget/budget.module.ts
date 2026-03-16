import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BudgetPageRoutingModule } from './budget-routing.module';
import { BudgetPage } from './budget.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    BudgetPageRoutingModule
  ],
  declarations: [BudgetPage]
})
export class BudgetPageModule {}
