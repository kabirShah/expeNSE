import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { ExpenseService } from 'src/app/services/expense.service';
import { Router } from '@angular/router';

import { Filesystem, Directory } from '@capacitor/filesystem';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Share } from '@capacitor/share';
import { Expense } from 'src/app/models/expense.model';
import { MockNotificationService } from 'src/app/services/mock-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './single-view-expenses.page.html',
  styleUrls: ['./single-view-expenses.page.scss'],
})
export class SingleViewExpensesPage implements OnInit, OnDestroy {

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];

  searchTerm: string = '';
  selectedPeriod: string = 'month';
  loading = false;
  private expensesSub?: Subscription;

  constructor(
    private navCtrl: NavController,
    private db: ExpenseService,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private mockNotificationService: MockNotificationService
  ) {}

  ngOnInit() {
    this.expensesSub = this.db.expenses$.subscribe((items) => {
      this.expenses = items || [];
      this.applySearchFilter();
    });

    this.loadExpenses();
  }

  ionViewWillEnter() {
    if (!this.expenses.length) {
      this.loadExpenses();
    }
  }

  ngOnDestroy() {
    this.expensesSub?.unsubscribe();
  }

  loadExpenses() {
    this.loading = true;

    this.db.getExpenses(this.selectedPeriod).subscribe({
      next: (res) => {
        if (res.success) {
          this.db.setExpenses(res.data || []);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching expenses:', err);
        this.loading = false;
      },
    });
  }

  onPeriodChange() {
    this.loadExpenses();
  }

  applySearchFilter() {
    if (!this.searchTerm) {
      this.filteredExpenses = this.expenses;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();

    this.filteredExpenses = this.expenses.filter(exp =>
      exp.description?.toLowerCase().includes(searchLower) ||
      exp.category?.name?.toLowerCase().includes(searchLower)
    );
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
            const deleting = this.expenses.find((exp) => String(exp.id) === id);

            this.db.deleteExpense(id).subscribe({
              next: () => {
                this.db.removeExpenseFromCache(Number(id));
                this.mockNotificationService.addCrudNotification(
                  'Expense',
                  'deleted',
                  `${deleting?.description || 'Expense'} was deleted.`
                );
              },
              error: (err) => console.error('Delete error:', err)
            });
          },
        },
      ],
    });

    await alert.present();
  }

  get totalFilteredAmount(): number {
    return this.filteredExpenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  }

  getCategoryName(expense: any): string {
    return expense.category?.name || '';
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

  async exportToPDF() {

    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFontSize(16);
    doc.text('Expense Report', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      105,
      22,
      { align: 'center' }
    );

    const sourceData = this.filteredExpenses;

    if (!sourceData.length) {
      alert('No data available to export');
      return;
    }

    const tableData = sourceData.map((expense, index) => [
      index + 1,
      expense.description || '-',
      expense.category?.name || '-',
      new Date(expense.date).toLocaleDateString(),
      `₹${Number(expense.amount).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Description', 'Category', 'Date', 'Amount']],
      body: tableData,
      styles: { fontSize: 9 },
      columnStyles: { 4: { halign: 'right' } }
    });

    const total = this.totalFilteredAmount;
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text(`Total Amount: ₹${total.toFixed(2)}`, 140, finalY);

    const pdfBlob = doc.output('blob');
    const fileName = 'Expense_Report.pdf';

    if (this.platform.is('capacitor')) {
      await this.savePDFToDevice(pdfBlob, fileName);
    } else {
      doc.save(fileName);
    }
  }

  async savePDFToDevice(pdfBlob: Blob, fileName: string) {

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64Data = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    await Share.share({
      title: 'Expense Report',
      text: 'Here is my Expense Report',
      url: result.uri,
      dialogTitle: 'Share Expense Report',
    });
  }

  async importPDF() {
    console.log('Upcoming feature');
  }
}


