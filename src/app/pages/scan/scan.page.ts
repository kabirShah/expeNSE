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

  // UI State Variables (Fixes the HTML errors)
  isPreviewOpen = false;
  currentPreviewImage: string | null = null;

  // Data
  isLoading = false;
  hasLoadError = false;
  loadErrorMessage = '';
  receipts: any[] = [];
  newReceipt: any = { imageUrl: null, base64Data: null, price: null, notes: '' };

  constructor(
    private receiptService: ReceiptService,
    private alertCtrl: AlertController,
    private uiToast: UiToastService
  ) {}

  ngOnInit() {
    this.loadReceipts();
  }

  loadReceipts() {
    this.isLoading = true;
    this.hasLoadError = false;
    this.loadErrorMessage = '';

    this.receiptService.getReceipts().subscribe({
      next: (res) => {
        if (res?.success) {
          // Map backend response to UI variables
          this.receipts = res.data.map((r: any) => ({
            id: r.id,
            // Use file_url if available, otherwise image_url
            image_url: r.file_url ?? r.image_url, 
            price: r.amount ?? null,
            notes: r.title,
            date: r.created_at
          }));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading receipts', err);
        this.hasLoadError = true;
        this.loadErrorMessage = 'Unable to load receipt history.';
        this.isLoading = false;
      }
    });
  }

  retryLoadReceipts() {
    this.loadReceipts();
  }

  // --- CAMERA LOGIC ---

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
      }

    } catch (err) {
      // User cancelled or error
    }
  }

  // --- SAVE & DELETE ---

  saveReceipt() {
    if (!this.newReceipt.base64Data || !this.newReceipt.price) return;
    this.isLoading = true;

    // Use specific format expected by your service
    const base64ToSend = `data:image/jpeg;base64,${this.newReceipt.base64Data}`;

    this.receiptService.saveReceipt(
      base64ToSend,
      this.newReceipt.price,
      this.newReceipt.notes
    ).subscribe({
      next: () => {
        // Reset Form
        this.newReceipt = { imageUrl: null, base64Data: null, price: null, notes: '' };
        this.loadReceipts();
        this.showToast("Receipt saved successfully", "success");
      },
      error: () => {
        this.isLoading = false;
        this.showToast("Failed to save receipt", "danger");
      }
    });
  }

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
              this.showToast("Failed to delete receipt", "danger");
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // --- PREVIEW MODAL LOGIC (Inline) ---

  openPreview(imageSource: string) {
    this.currentPreviewImage = imageSource;
    this.isPreviewOpen = true;
  }

  closePreview() {
    this.isPreviewOpen = false;
    this.currentPreviewImage = null;
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' | 'medium') {
    await this.uiToast.show(message, color);
  }
}
