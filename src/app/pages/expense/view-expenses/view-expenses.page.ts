import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.page.html',
})
export class ViewExpensesPage implements OnInit {
  expenses: any[] = []; 
  ngOnInit() {
    this.loadExpenses();
  }
  loadExpenses(){
    // Retrieve the expenses array from localStorage
    const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    this.expenses = storedExpenses;
  }
  ionViewWillEnter() {
    this.expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  }
}
