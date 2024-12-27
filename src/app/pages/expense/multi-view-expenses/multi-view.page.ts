import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Expense } from 'src/app/models/expense.model';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-multi-view',
  templateUrl: './multi-view.page.html',
  styleUrls: ['./multi-view.page.scss'],
})
export class MultiViewPage implements OnInit {

  autoExpenses: any[] = [];
  filteredExpenses: any[] = [];
  searchTerm: string = '';
  selectedMonth: string = 'all';

  constructor(private router: Router, private db: DatabaseService) {}

  ngOnInit() {
    this.loadAutoExpenses();
  }

  async loadAutoExpenses() {
    this.autoExpenses = await this.db.getAllAutoExpenses();
    this.applyFilters();
  }
  async applyFilters(){
    this.filteredExpenses = this.autoExpenses.filter((expense) => {
      let matchesSearch = true;
      let matchesMonth = true;

      // Apply Search Filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        matchesSearch = expense.description.toLowerCase().includes(searchLower) || 
                        expense.category.toLowerCase().includes(searchLower);
      }

      // Apply Month Filter
      if (this.selectedMonth && this.selectedMonth !== 'all') {
        const expenseMonth = new Date(expense.date).toLocaleString('default', { month: 'long' });
        matchesMonth = expenseMonth === this.selectedMonth;
      }

      return matchesSearch && matchesMonth;
    });
  }
  async editAutoExpense(id: string){
    await this.router.navigate(['/multi-view-expense/multi-expense/:id']);
  }
  async deleteAutoExpense(id: string) {
    await this.db.deleteAutoExpense(id);
    this.loadAutoExpenses();
  }
  navigateToMultiExpense(){
    this.router.navigate(['/multi-expense']);
  }
}
