import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-scan-receipt',
  templateUrl: './scan-receipt.page.html',
  styleUrls: ['./scan-receipt.page.scss'],
})
export class ScanReceiptPage {
  processing = false;
  lastReceipt: any = null;

  constructor(private receiptService: ReceiptService) {}

  async scan() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (!image) return;

    const blob = this.dataUrlToBlob(image.dataUrl!);
    const fd = new FormData();
    fd.append('image', blob, 'receipt.jpg');

    this.processing = true;
    this.receiptService.uploadImage(fd).subscribe((res) => {
      this.processing = false;
      this.lastReceipt = res.data.receipt;
      // Trigger OCR
      this.receiptService.ocr(this.lastReceipt.id).subscribe();
    }, () => this.processing = false);
  }

  async pickFromGallery() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    if (!image) return;

    const blob = this.dataUrlToBlob(image.dataUrl!);
    const fd = new FormData();
    fd.append('image', blob, 'receipt.jpg');
    this.processing = true;
    this.receiptService.uploadImage(fd).subscribe((res) => {
      this.processing = false;
      this.lastReceipt = res.data.receipt;
      this.receiptService.ocr(this.lastReceipt.id).subscribe();
    }, () => this.processing = false);
  }

  dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}
