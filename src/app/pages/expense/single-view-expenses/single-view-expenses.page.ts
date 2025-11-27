import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { ExpenseService  } from 'src/app/services/expense.service';
import { Router } from '@angular/router';

//Share, PDF and File

import { Filesystem, Directory } from '@capacitor/filesystem';
import { File } from "@ionic-native/file/ngx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Share } from '@capacitor/share';
import * as pdfjsLib from 'pdfjs-dist';
import { Expense } from 'src/app/models/expense.model';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './single-view-expenses.page.html',
  styleUrls: ['./single-view-expenses.page.scss'],
})
export class SingleViewExpensesPage implements OnInit {
  arr:any[]=[];
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  data: any[] = [];
  searchTerm: string = '';
  selectedMonth: string = 'all';
  loading = false;



  constructor(
    private navCtrl: NavController,
    private db: ExpenseService,
    private file:File,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private socialSharing: SocialSharing) {
  }

  ngOnInit() {
    this.loadExpenses();
  }
  
  ionViewWillEnter() {
    this.loadExpenses();
  }
  loadExpenses() {
    this.loading = true;
    this.db.getExpenses().subscribe({
      next: (res) => {
        if (res.success) {
          this.expenses = res.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching expenses:', err);
        this.loading = false;
      },
    });
  }
  async loadManualExpenses() {
    // Retrieve the expenses array from localStorage
    this.applyFilters();
  }
  applyFilters() {
    this.filteredExpenses = this.expenses.filter((expense) => {
      let matchesSearch = true;
      let matchesMonth = true;

      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        matchesSearch =
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower);
      }

      // Month filter
      if (this.selectedMonth && this.selectedMonth !== 'all') {
        const expenseMonth = new Date(expense.date).toLocaleString('default', {
          month: 'long',
        });
        matchesMonth = expenseMonth === this.selectedMonth;
      }

      return matchesSearch && matchesMonth;
    });
  }
 async deleteExpense(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this record?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: () => {
            this.db.deleteExpense(id).subscribe({
              next: () => {
                this.loadExpenses(); // refresh list
              },
              error: (err) => console.error('Delete error:', err),
            });
          },
        },
      ],
    });
    await alert.present();
  }

 // PDF Export Function
 async exportToPDF() {
  const doc = new jsPDF();

    doc.text('Expense Report', 105, 10, { align: 'center' });

    // Table Data
    const tableData = this.expenses.map(
      (expense, index) => [
        index + 1,
        expense.description,
        `₹${Number(expense.amount).toFixed(2)}`,
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
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      // Save PDF to device
      await this.savePDFToDevice(pdfOutput, fileName);
    } else {
      // Browser Download (Fallback for Web)
      doc.save(fileName);
    }
  }
  async savePDFToDevice(pdfBlob: Blob, fileName: string){
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64Data = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    try {
      const filePath = `Documents/${fileName}`;
      const result = await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      console.log('PDF saved at:', result.uri);

      // Share the PDF
      await this.sharePDF(result.uri, fileName);
    } catch (error) {
      console.error('Error saving PDF:', error);
    }
  }
    getCategoryName(expense: any): string {
  return expense.category?.name || '';
}
get totalFilteredAmount(): number {
    if (!this.filteredExpenses) return 0;
    return this.filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }
  private async sharePDF(filePath: string, fileName: string) {
    try {
      await Share.share({
        title: 'Expense Report',
        text: 'Here is my Expense Report!',
        url: filePath,
        dialogTitle: 'Share Expense Report',
      });
      console.log('PDF shared successfully!');
    } catch (error) {
      console.error('Error sharing PDF:', error);
    }
  }
  async importPDF() {
    console.log("Upcoming");
  }

  
  editExpense(id: string) {
    this.router.navigate(['/single-expense', id]);
  }

  navigateToAddExpense() {
    this.router.navigate(['/single-expense']);
  }

  trackById(index: number, item: any): any {
    return item.id;
  }

}
