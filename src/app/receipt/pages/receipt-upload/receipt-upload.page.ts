/**
 * Receipt Upload Page
 * Handles receipt upload with camera and gallery support
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReceiptService } from '../../../services/receipt.service';

interface FilePreview {
  path?: string;
  uri?: string;
  webPath?: string;
  mimeType?: string;
  name?: string;
  size?: number;
  dataUrl?: string;
}

@Component({
  selector: 'app-receipt-upload',
  templateUrl: './receipt-upload.page.html',
  styleUrls: ['./receipt-upload.page.scss'],
})
export class ReceiptUploadPage implements OnInit, OnDestroy {
  // Files
  files: FilePreview[] = [];
  isUploading = false;
  uploadProgress = 0;

  // Form
  uploadForm: FormGroup;
  showAdvancedOptions = false;

  // State
  isOnline = true;
  private destroy$ = new Subject<void>();

  // Constants
  readonly MAX_FILES = 10;
  readonly MAX_FILE_SIZE_MB = 25;
  readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
  ];

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.maxLength(255)]],
      notes: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.monitorNetworkStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────────────────────────────────────────────────────────────
  // NETWORK
  // ──────────────────────────────────────────────────────────────────────

  private monitorNetworkStatus(): void {
    this.receiptService
      .getOnlineStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
      });
  }

  // ──────────────────────────────────────────────────────────────────────
  // SOURCE SELECTION
  // ──────────────────────────────────────────────────────────────────────

  async showSourcePicker(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Add Receipt',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => this.captureCamera(),
        },
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => this.pickFromGallery(),
        },
        {
          text: 'Upload PDF/File',
          icon: 'document-outline',
          handler: () => this.pickFile(),
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await sheet.present();
  }

  // ──────────────────────────────────────────────────────────────────────
  // CAPTURE & SELECTION
  // ──────────────────────────────────────────────────────────────────────

  async captureCamera(): Promise<void> {
    if (this.files.length >= this.MAX_FILES) {
      await this.showError(`Maximum ${this.MAX_FILES} files allowed`);
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true,
        saveToGallery: false,
      });

      if ((photo as any).webPath) {
        // Get file blob for size checking
        const blob = await this.urlToBlob((photo as any).webPath);
        const sizeMB = blob.size / (1024 * 1024);

        if (sizeMB > this.MAX_FILE_SIZE_MB) {
          await this.showError(`File size exceeds ${this.MAX_FILE_SIZE_MB}MB limit`);
          return;
        }

        this.files.push({
          path: (photo as any).path || (photo as any).webPath,
          uri: (photo as any).uri || (photo as any).path || (photo as any).webPath,
          webPath: (photo as any).webPath,
          mimeType: 'image/jpeg',
          name: `receipt_${Date.now()}.jpg`,
          size: blob.size,
        });

        await this.showSuccess('Photo captured');
      }
    } catch (error: any) {
      if (!error?.message?.includes('cancelled')) {
        console.error('Camera error:', error);
        await this.showError('Could not access camera. Check permissions.');
      }
    }
  }

  async pickFromGallery(): Promise<void> {
    if (this.files.length >= this.MAX_FILES) {
      await this.showError(`Maximum ${this.MAX_FILES} files allowed`);
      return;
    }

    try {
      const result = await FilePicker.pickImages({
        readData: true,
      });

      if (result.files) {
        for (const file of result.files) {
          if (this.files.length >= this.MAX_FILES) break;

          const sizeMB = file.size / (1024 * 1024);
          if (sizeMB > this.MAX_FILE_SIZE_MB) {
            console.warn(`File ${file.name} exceeds size limit`);
            continue;
          }

          const webPath = (file as any).webPath ?? '';
          const dataUrl = (file as any).data ? `data:${file.mimeType};base64,${(file as any).data}` : undefined;

          this.files.push({
            path: (file as any).path ?? webPath,
            uri: (file as any).uri ?? (file as any).path ?? webPath,
            webPath,
            mimeType: (file as any).mimeType ?? 'image/jpeg',
            name: (file as any).name ?? `receipt_${Date.now()}.jpg`,
            size: (file as any).size ?? 0,
            dataUrl,
          });
        }

        if (this.files.length > 0) {
          await this.showSuccess(`${this.files.length} file(s) selected`);
        }
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      await this.showError('Could not access gallery');
    }
  }

  async pickFile(): Promise<void> {
    if (this.files.length >= this.MAX_FILES) {
      await this.showError(`Maximum ${this.MAX_FILES} files allowed`);
      return;
    }

    try {
      const result = await FilePicker.pickFiles({
        readData: true,
        types: ['application/pdf', 'image/jpeg', 'image/png'],
      });

      if (result.files && result.files.length > 0) {
        const file = result.files[0];
        const sizeMB = file.size / (1024 * 1024);

        if (sizeMB > this.MAX_FILE_SIZE_MB) {
          await this.showError(`File size exceeds ${this.MAX_FILE_SIZE_MB}MB limit`);
          return;
        }

        const dataUrl = (file as any).data ? `data:${file.mimeType};base64,${(file as any).data}` : undefined;

        this.files.push({
          path: (file as any).path ?? (file as any).webPath,
          uri: (file as any).uri ?? (file as any).path ?? (file as any).webPath,
          webPath: (file as any).webPath ?? undefined,
          mimeType: (file as any).mimeType ?? 'application/pdf',
          name: (file as any).name ?? 'file',
          size: (file as any).size ?? 0,
          dataUrl,
        });

        await this.showSuccess('File selected');
      }
    } catch (error) {
      console.error('File picker error:', error);
      await this.showError('Could not access file picker');
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // FILE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  clearAllFiles(): void {
    this.files = [];
    this.uploadProgress = 0;
  }

  async removeFileConfirm(index: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Remove File',
      message: 'Remove this file from upload?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => this.removeFile(index),
        },
      ],
    });
    await alert.present();
  }

  // ──────────────────────────────────────────────────────────────────────
  // UPLOAD
  // ──────────────────────────────────────────────────────────────────────

  async uploadReceipts(): Promise<void> {
    if (this.files.length === 0) {
      await this.showError('Please select at least one file');
      return;
    }

    if (!this.uploadForm.valid) {
      await this.showError('Please fill in all required fields');
      return;
    }

    // Convert preview objects to File objects
    const fileObjects: File[] = [];
    for (const preview of this.files) {
      try {
        const blob = await this.buildBlobFromPreview(preview);
        const file = new File([blob], preview.name ?? `receipt_${Date.now()}.jpg`, { type: preview.mimeType });
        fileObjects.push(file);
      } catch (error) {
        console.error('Error converting file:', error);
        await this.showError('Failed to process file: ' + (preview.name ?? 'unknown'));
        return;
      }
    }

    const loading = await this.loadingCtrl.create({
      message: 'Uploading receipt...',
      spinner: 'crescent',
    });
    await loading.present();

    this.isUploading = true;

    // Monitor upload progress
    const progressSub = this.receiptService
      .getUploadProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.uploadProgress = progress;
        loading.message = `Uploading receipt... ${progress}%`;
      });

    const metadata = {
      title: this.uploadForm.value.title || undefined,
      notes: this.uploadForm.value.notes || undefined,
    };

    this.receiptService
      .uploadReceipt(fileObjects, metadata)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          progressSub.unsubscribe();
          loading.dismiss();
          this.isUploading = false;

          if (response.data) {
            this.handleUploadSuccess(response.data.id);
          } else {
            this.handleUploadQueued();
          }
        },
        error: error => {
          progressSub.unsubscribe();
          loading.dismiss();
          this.isUploading = false;

          console.error('Upload error:', error);
          this.handleUploadError(error);
        },
      });
  }

  private handleUploadSuccess(receiptId: number): void {
    this.clearAllFiles();
    this.uploadForm.reset();
      this.router.navigate(['/receipt/review', receiptId]);
  }

  private handleUploadQueued(): void {
    this.clearAllFiles();
    this.uploadForm.reset();
    this.showSuccess('Receipt queued for upload. Will sync when online.');
      this.router.navigate(['/receipt/list']);
  }

  private async handleUploadError(error: any): Promise<void> {
    let errorMessage = 'Failed to upload receipt';

    if (error?.status === 413) {
      errorMessage = 'File too large';
    } else if (error?.status === 422) {
      errorMessage = 'Invalid file format';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    await this.showError(errorMessage);
  }

  // ──────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────

  private async buildBlobFromPreview(preview: FilePreview): Promise<Blob> {
    if (preview.dataUrl) {
      return this.base64ToBlob(preview.dataUrl);
    }

    const source = preview.webPath ?? preview.uri ?? preview.path;
    if (!source) {
      throw new Error('No file source available');
    }

    return this.urlToBlob(source);
  }

  private async urlToBlob(url: string): Promise<Blob> {
    try {
      const response = await fetch(url);
      return await response.blob();
    } catch (error) {
      if (url.startsWith('file://') || url.startsWith('content://')) {
        const path = url.replace(/^file:\/\//, '');
        const result = await Filesystem.readFile({ path });
        const dataUrl = `data:application/octet-stream;base64,${result.data}`;
        return this.base64ToBlob(dataUrl);
      }

      throw error;
    }
  }

  private base64ToBlob(dataUrl: string): Blob {
    const [header, base64Data] = dataUrl.split(',');
    const contentType = header.split(':')[1].split(';')[0];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  formatFileSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)) || 0;
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(mimeType?: string): string {
    if (!mimeType) return 'document-text-outline';
    if (mimeType.startsWith('image/')) return 'image-outline';
    if (mimeType === 'application/pdf') return 'document-outline';
    return 'document-text-outline';
  }

  private async showError(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      icon: 'alert-circle-outline',
    });
    await toast.present();
  }

  private async showSuccess(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }
}
