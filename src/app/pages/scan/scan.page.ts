import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ReceiptService } from '../../services/receipt.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScanPage implements OnInit {

  isPreviewOpen = false;
  currentPreviewImage: string | null = null;

  isLoading = false;
  hasLoadError = false;
  loadErrorMessage = '';

  receipts: any[] = [];

  newReceipt: any = {
    imageUrl: null,
    base64Data: null,
    price: null,
    notes: ''
  };

  constructor(
    private receiptService: ReceiptService,
    private alertCtrl: AlertController,
    private uiToast: UiToastService
  ) {}

  ngOnInit() {
    this.loadReceipts();
  }

  // ================= LOAD RECEIPTS =================
  loadReceipts() {
    this.isLoading = true;

    this.receiptService.getReceipts().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.receipts = res.data.map((r: any) => ({
            id: r.id,
            image_url: r.file_url,
            price: r.total_amount,
            notes: r.title,
            date: r.created_at
          }));
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasLoadError = true;
        this.loadErrorMessage = 'Failed to load receipts';
      }
    });
  }

  // ================= CAMERA =================
  async captureImage() {
    await this.takePhoto(CameraSource.Camera);
  }

  async pickFromGallery() {
    await this.takePhoto(CameraSource.Photos);
  }

  async takePhoto(source: CameraSource) {
    try {
      const result = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source,
        quality: 70
      });

      if (result.base64String) {
        this.newReceipt.base64Data = result.base64String;
        this.newReceipt.imageUrl = "data:image/jpeg;base64," + result.base64String;

        // 🔥 AUTO OCR SCAN
        this.scanReceipt();
      }

    } catch (err) {
      console.error('Camera error:', err);
    }
  }

  // ================= OCR + SAVE =================
  scanReceipt() {
    if (!this.newReceipt.base64Data) return;

    this.isLoading = true;

    this.receiptService.uploadReceipt(this.newReceipt.base64Data)
      .subscribe({
        next: (res: any) => {

          if (res?.success) {
            const data = res.data;

            this.newReceipt.price = data.amount;
            this.newReceipt.notes = data.title;

            this.showToast('Receipt scanned & expense added', 'success');

            this.loadReceipts();
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.showToast('Scan failed', 'danger');
        }
      });
  }

  // ================= DELETE =================
  async deleteReceipt(id: number) {
    const alert = await this.alertCtrl.create({
      header: "Delete Receipt?",
      message: "This cannot be undone.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          role: 'destructive',
          handler: () => {
            this.isLoading = true;

            this.receiptService.deleteReceipt(id).subscribe(() => {
              this.showToast("Receipt deleted", "medium");
              this.loadReceipts();
            }, () => {
              this.isLoading = false;
              this.showToast("Delete failed", "danger");
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // ================= PREVIEW =================
  openPreview(image: string) {
    this.currentPreviewImage = image;
    this.isPreviewOpen = true;
  }

  closePreview() {
    this.isPreviewOpen = false;
    this.currentPreviewImage = null;
  }

  // ================= TOAST =================
  async showToast(message: string, color: any) {
    await this.uiToast.show(message, color);
  }
}