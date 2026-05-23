import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedFinancePageRoutingModule } from './shared-finance-routing.module';
import { SharedFinancePage } from './shared-finance.page';
import { ActivityFeedCardComponent } from 'src/app/components/shared-finance/activity-feed-card/activity-feed-card.component';
import { AnalyticsCardComponent } from 'src/app/components/shared-finance/analytics-card/analytics-card.component';
import { BalanceSummaryCardComponent } from 'src/app/components/shared-finance/balance-summary-card/balance-summary-card.component';
import { ExpenseSplitCardComponent } from 'src/app/components/shared-finance/expense-split-card/expense-split-card.component';
import { FriendCardComponent } from 'src/app/components/shared-finance/friend-card/friend-card.component';
import { GroupCardComponent } from 'src/app/components/shared-finance/group-card/group-card.component';
import { SettlementCardComponent } from 'src/app/components/shared-finance/settlement-card/settlement-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedFinancePageRoutingModule
  ],
  declarations: [
    SharedFinancePage,
    ActivityFeedCardComponent,
    AnalyticsCardComponent,
    BalanceSummaryCardComponent,
    ExpenseSplitCardComponent,
    FriendCardComponent,
    GroupCardComponent,
    SettlementCardComponent
  ]
})
export class SharedFinancePageModule {}
