import { Component, OnInit } from '@angular/core';
import { Expense } from 'src/app/models/expense.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-view-drop',
  templateUrl: './view-drop.page.html',
  styleUrls: ['./view-drop.page.scss'],
})
export class ViewDropPage implements OnInit {

  autoExpenses: any[] = [];


  constructor(private db: DatabaseService) {}

  ngOnInit() {
    this.loadAutoExpenses();
  }

  async loadAutoExpenses() {
    this.autoExpenses = await this.db.getAllAutoExpenses();
  }

  async deleteAutoExpense(id: string) {
    await this.db.deleteAutoExpense(id);
    this.loadAutoExpenses();
  }

}
