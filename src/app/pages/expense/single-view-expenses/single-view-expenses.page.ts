import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Expense } from '../../../models/expense.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { File } from "@ionic-native/file/ngx";
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './single-view-expenses.page.html',
})
export class SingleViewExpensesPage implements OnInit {
  manualExpenses: any[] = [];
  autoExpenses: any[]=[];
  arr:any[]=[];
  expenses: any[] = [];
  data: any[] = [];

  constructor(
    private navCtrl: NavController,
    private db: DatabaseService,
    private file:File,
    private alertController: AlertController,
    private router: Router,
    private socialSharing: SocialSharing) {
  }

  ngOnInit() {
    this.loadManualExpenses();
  }

  ionViewWillEnter() {
    this.loadManualExpenses();
  }

  async loadManualExpenses() {
    // Retrieve the expenses array from localStorage
    this.manualExpenses = await this.db.getAllManualExpenses();
  }

  async deleteExpense(id: string, rev: string) {
    await this.db.deleteManualExpense(id,rev);
    this.loadManualExpenses();
  }

 // PDF Export Function
 exportToPDF() {
  const doc = new jsPDF();

    doc.text('Expense Report', 105, 10, { align: 'center' });

    // Table Data
    const tableData = [...this.manualExpenses, ...this.autoExpenses].map(
      (expense, index) => [
        index + 1,
        expense.description,
        `₹${expense.amount.toFixed(2)}`,
        new Date(expense.date).toLocaleDateString(),
        expense.category,
      ]
    );

    autoTable(doc, {
      head: [['#', 'Description', 'Amount', 'Date', 'Category']],
      body: tableData,
      startY: 20,
    });

    // Save PDF
    const pdfOutput = doc.output('blob');
    const fileName = 'Expense_Report.pdf';

    // Save File to Device
    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      const fileURL = fileReader.result as string; // Type assertion
      if (fileURL) {
        try {
          // Share through WhatsApp
          await this.socialSharing.shareViaWhatsApp(
            'Here is my Expense Report!',
            fileURL, // Ensures correct type
            ''
          );
          console.log('Shared successfully!');
        } catch (error) {
          console.error('Error sharing file:', error);
        }
      } else {
        console.error('File URL is null or undefined');
      }
    };
    fileReader.readAsDataURL(pdfOutput);
  }
  editExpense(id:string) {
    this.router.navigate(['/single-view-expenses/single-expense',id]);
  }
 
  navigateToAddExpense(){
    this.router.navigate(['/single-expense']);
  }

}
