import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../../services/database.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.page.html',
})
export class EditExpensePage{
  expenseId: number;
  expense: any = {};

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {
    this.expenseId = +this.route.snapshot.paramMap.get('id')!;
  }

  async updateExpense() {
    this.navCtrl.navigateBack('/view-expenses');
  }
}
