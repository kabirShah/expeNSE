import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private dbInstance!: SQLiteObject; // Declare the database instance

  constructor(private sqlite: SQLite) {
    this.createDatabase(); // Call to create the database upon service initialization
  }

  // Method to create the SQLite database
  private createDatabase() {
    this.sqlite.create({
      name: 'expense.db', // Name of the database
      location: 'default', // Default location
    }).then((db: SQLiteObject) => {
      this.dbInstance = db; // Assign the database instance
      this.initializeDatabase(); // Initialize tables
    }).catch(error => {
      console.error('Error creating database', error);
    });
  }

  // Initialize the database tables
  private initializeDatabase() {
    const query = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        category TEXT,
        transactionType TEXT,
        description TEXT,
        amount REAL,
        notes TEXT
      )
    `;
    this.dbInstance.executeSql(query, []).then(() => {
      console.log('Table created successfully');
    }).catch(error => {
      console.error('Error creating table', error);
    });
  }
}
