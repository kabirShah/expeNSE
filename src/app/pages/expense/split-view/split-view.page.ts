import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-split-view',
  templateUrl: './split-view.page.html',
  styleUrls: ['./split-view.page.scss'],
})
export class SplitViewPage implements OnInit {
  splitExpenses: any[] = [];

  constructor(private dbService: DatabaseService, private router: Router) {}

  async ngOnInit() {
    this.loadExpenses();
  }

  async loadExpenses() {
    this.splitExpenses = await this.dbService.getSplitExpenses();
    console.log('Loaded split expenses:', this.splitExpenses);
  }

  async deleteExpense(id: string) {
    await this.dbService.deleteSplitExpense(id);
    this.loadExpenses();
  }

  addSplit() {
    this.router.navigate(['/split']);
  }
}