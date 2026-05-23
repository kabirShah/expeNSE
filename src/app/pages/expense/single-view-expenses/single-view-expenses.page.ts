import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController, AlertController, InfiniteScrollCustomEvent, Platform } from '@ionic/angular';
import { ExpenseService, PaginatedResponse } from 'src/app/services/expense.service';
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
  private readonly pageSize = 10;

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  paymentSourceFeatureEnabled = false;

  searchTerm: string = '';
  selectedPeriod: string = 'month';
  loading = false;
  loadingMore = false;
  hasMoreRecords = true;
  private currentPage = 1;
  private isNavigating = false;
  private expensesSub?: Subscription;
  private autoDetectedHandler = () => this.refreshExpenses();

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

    this.db.getCategories().subscribe({
      error: (err) => console.error('Error preloading categories:', err)
    });

    if (this.db.getCachedExpenses().length) {
      this.expenses = this.db.getCachedExpenses();
      this.applySearchFilter();
      this.refreshExpenses();
      window.addEventListener('expense:auto-detected', this.autoDetectedHandler);
      return;
    }

    this.loadExpenses(true);
    window.addEventListener('expense:auto-detected', this.autoDetectedHandler);
  }

  ionViewWillEnter() {
    if (!this.expenses.length) {
      this.loadExpenses(true);
      return;
    }

    this.refreshExpenses();
  }

  ngOnDestroy() {
    this.expensesSub?.unsubscribe();
    window.removeEventListener('expense:auto-detected', this.autoDetectedHandler);
  }

  loadExpenses(reset: boolean = false, event?: any) {
    if (reset) {
      this.currentPage = 1;
      this.hasMoreRecords = true;
      this.loading = !this.expenses.length;
    } else if (!this.hasMoreRecords || this.loadingMore) {
      event?.target.complete();
      return;
    } else {
      this.loadingMore = true;
    }

    const page = reset ? 1 : this.currentPage + 1;

    this.db.getExpenses(this.selectedPeriod, page, this.pageSize).subscribe({
      next: (res) => {
        if (res.success) {
          this.paymentSourceFeatureEnabled = !!res?.features?.enable_payment_source_detection;
          const pagination = this.normalizePage(res.data);
          const nextExpenses = reset
            ? this.mergeExpenses(this.getOptimisticExpenses(), pagination.data)
            : this.mergeExpenses(this.db.getCachedExpenses(), pagination.data);

          this.currentPage = pagination.current_page;
          this.hasMoreRecords = pagination.current_page < pagination.last_page;
          this.db.setExpenses(nextExpenses);
        }
        this.finishLoading(event);
      },
      error: (err) => {
        console.error('Error fetching expenses:', err);
        this.finishLoading(event);
      },
    });
  }

  onPeriodChange() {
    this.loadExpenses(true);
  }

  loadMoreExpenses(event: Event) {
    this.loadExpenses(false, event as InfiniteScrollCustomEvent);
  }

  refreshExpensesList(event: Event) {
    this.loadExpenses(true, event);
  }

  private refreshExpenses() {
    this.db.getExpenses(this.selectedPeriod, 1, this.pageSize).subscribe({
      next: (res) => {
        if (!res.success) {
          return;
        }

        this.paymentSourceFeatureEnabled = !!res?.features?.enable_payment_source_detection;
        const pagination = this.normalizePage(res.data);
        const merged = this.mergeExpenses(
          this.getOptimisticExpenses(),
          pagination.data,
          this.db.getCachedExpenses()
        );

        this.currentPage = pagination.current_page;
        this.hasMoreRecords = pagination.current_page < pagination.last_page;
        this.db.setExpenses(merged);
      },
      error: (err) => {
        console.error('Error refreshing expenses:', err);
      }
    });
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

  getPaymentSourceLabel(source: string | null | undefined): string {
    switch (source) {
      case 'gpay':
        return 'GPay';
      case 'phonepe':
        return 'PhonePe';
      case 'paytm':
        return 'Paytm';
      case 'upi':
        return 'UPI';
      case 'bank':
        return 'Bank';
      case 'unknown':
        return 'Unknown';
      default:
        return '';
    }
  }

  getPaymentSourceIcon(source: string | null | undefined): string {
    switch (source) {
      case 'gpay':
        return 'logo-google';
      case 'phonepe':
        return 'wallet-outline';
      case 'paytm':
        return 'card-outline';
      case 'upi':
        return 'swap-horizontal-outline';
      case 'bank':
        return 'business-outline';
      default:
        return 'help-circle-outline';
    }
  }

  isAutoDetected(expense: Expense): boolean {
    return ['sms', 'notification'].includes(String(expense?.source_type || '')) && !expense?.source_ref_id;
  }

  async editExpense(id: string) {
    if (this.isNavigating) {
      return;
    }

    this.isNavigating = true;

    try {
      await this.router.navigate(['/single-expense', id]);
    } finally {
      this.isNavigating = false;
    }
  }

  async navigateToAddExpense() {
    if (this.isNavigating) {
      return;
    }

    this.isNavigating = true;

    try {
      await this.router.navigate(['/single-expense']);
    } finally {
      this.isNavigating = false;
    }
  }

  trackById(index: number, item: any): any {
    return item.id;
  }

  private normalizePage(data: PaginatedResponse<Expense> | Expense[]): PaginatedResponse<Expense> {
    if (Array.isArray(data)) {
      return {
        current_page: 1,
        data,
        last_page: 1,
        per_page: data.length,
        total: data.length
      };
    }

    return {
      current_page: Number(data?.current_page) || 1,
      data: data?.data || [],
      last_page: Number(data?.last_page) || 1,
      per_page: Number(data?.per_page) || this.pageSize,
      total: Number(data?.total) || 0
    };
  }

  private mergeExpenses(...groups: Expense[][]): Expense[] {
    const merged = new Map<string, Expense>();
    const expenses = groups.reduce((all, group) => all.concat(group || []), [] as Expense[]);

    expenses.forEach((expense) => {
      if (!expense) {
        return;
      }

      const key = String(expense.id ?? expense.expense_id ?? `${expense.description}-${expense.date}-${expense.amount}`);
      if (!merged.has(key)) {
        merged.set(key, expense);
      }
    });

    return [...merged.values()].sort((a, b) => this.getExpenseSortTime(b) - this.getExpenseSortTime(a));
  }

  private getOptimisticExpenses(): Expense[] {
    return this.db.getCachedExpenses().filter((expense) => Number(expense.id) < 0);
  }

  private getExpenseSortTime(expense: Expense): number {
    const value = expense.date || expense.created_at || expense.updated_at;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private finishLoading(event?: any) {
    this.loading = false;
    this.loadingMore = false;
    event?.target.complete();
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


