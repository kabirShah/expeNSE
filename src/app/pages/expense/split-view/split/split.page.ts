import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-split',
  templateUrl: './split.page.html',
  styleUrls: ['./split.page.scss'],
})
export class SplitPage {
  title: string = '';
  totalAmount: number = 0;
  participants: any[] = [{ name: '', amount: 0 }];

  constructor(private dbExpense: DatabaseService, private router: Router) {}

  addParticipant() {
    this.participants.push({ name: '', amount: 0 });
  }

  removeParticipant(index: number) {
    this.participants.splice(index, 1);
  }

  async saveSplitExpense() {
    const expense = {
      title: this.title,
      total_amount: this.totalAmount,
      created_by: 'user_1', // Replace with logged-in user
      participants: this.participants.map(p => ({
        user_id: p.name,
        amount_owed: p.amount,
        amount_paid: 0,
        status: 'pending'
      })),
      created_at: new Date().toISOString()
    };

    await this.dbExpense.createSplitExpense(expense);
    this.router.navigate(['/split-view']); // Navigate back
  }
}
