import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbInstance!: SQLiteObject;

  constructor(private sqlite: SQLite) {}

  async initializeDatabase() {
    this.dbInstance = await this.sqlite.create({
      name: 'expense.db',
      location: 'default'
    });
    await this.createTables();
  }

  private async createTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        category TEXT,
        transactionType TEXT,
        description TEXT,
        amount REAL,
        notes TEXT
      );`;
    await this.dbInstance.executeSql(sql, []);
  }

  // Add a new expense
  async addExpense(expense: { date: string; category: string; transactionType: string; description: string; amount: number; notes: string }) {
    const sql = `INSERT INTO expenses (date, category, transactionType, description, amount, notes) VALUES (?, ?, ?, ?, ?, ?)`;
    return this.dbInstance.executeSql(sql, [
      expense.date,
      expense.category,
      expense.transactionType,
      expense.description,
      expense.amount,
      expense.notes
    ]);
  }

  // Get all expenses
  async getAllExpenses() {
    const sql = `SELECT * FROM expenses`;
    const result = await this.dbInstance.executeSql(sql, []);
    const expenses = [];
    for (let i = 0; i < result.rows.length; i++) {
      expenses.push(result.rows.item(i));
    }
    return expenses;
  }

  // Update an expense
  async updateExpense(id: number, updatedExpense: { date: string; category: string; transactionType: string; description: string; amount: number; notes: string }) {
    const sql = `UPDATE expenses SET date = ?, category = ?, transactionType = ?, description = ?, amount = ?, notes = ? WHERE id = ?`;
    return this.dbInstance.executeSql(sql, [
      updatedExpense.date,
      updatedExpense.category,
      updatedExpense.transactionType,
      updatedExpense.description,
      updatedExpense.amount,
      updatedExpense.notes,
      id
    ]);
  }

  // Delete an expense
  async deleteExpense(id: number) {
    const sql = `DELETE FROM expenses WHERE id = ?`;
    return this.dbInstance.executeSql(sql, [id]);
  }
}
