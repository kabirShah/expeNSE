import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { ReceiptService } from '../../services/receipt.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-scan-receipts',
  templateUrl: './scan-receipts.page.html',
  styleUrls: ['./scan-receipts.page.scss'],
})
export class ScanReceiptsPage implements OnInit {
  isLoading = false;
  hasError = false;
  errorMessage = '';

  receipts: any[] = [];

  constructor(
    private receiptService: ReceiptService,
    private uiToast: UiToastService,
    private navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.receiptService.getReceipts().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          this.receipts = res.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            total_amount: r.total_amount,
            amount: r.total_amount,
            currency: r.currency,
            file_url: r.file_url,
            created_at: r.created_at,
            date: r.created_at,
            confidence: r.confidence,
            status: r.status,
          }));
        } else {
          this.receipts = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.hasError = true;
        this.errorMessage = 'Failed to load receipts';
        void this.uiToast.show(this.errorMessage, 'danger');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  deleteReceipt(id: number): void {
    void this.receiptService.deleteReceipt(id).subscribe({
      next: () => {
        void this.uiToast.show('Receipt deleted', 'medium');
        this.loadReceipts();
      },
      error: (err) => {
        console.error(err);
        void this.uiToast.show('Delete failed', 'danger');
      }
    });
  }
}

