import { Component, OnInit } from '@angular/core';
import { Expense } from 'src/app/models/expense.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-view-drop',
  templateUrl: './view-drop.page.html',
  styleUrls: ['./view-drop.page.scss'],
})
export class ViewDropPage implements OnInit {

  expenses: Expense[] = [];

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.databaseService.getAllExpenses().then((data) => {
      this.expenses = data;
    });
  }

  deleteExpense(id: string) {
    this.databaseService.deleteExpense(id).then(() => {
      this.loadExpenses();
    });
  }

}
