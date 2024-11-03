import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage {
  expenses: any[] = [];

  ionViewWillEnter() {
    this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  }
}
