import { Component, OnInit } from '@angular/core';
import { Expense } from 'src/app/models/expense.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-multi-view',
  templateUrl: './multi-view.page.html',
  styleUrls: ['./multi-view.page.scss'],
})
export class MultiViewPage implements OnInit {

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
  
  async exportToExcel(){

  }
}
