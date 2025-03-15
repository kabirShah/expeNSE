import { Component, OnInit } from '@angular/core';
import { Invoice } from 'src/app/models/invoice.model';
import { DatabaseService } from 'src/app/services/database.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import Tesseract from 'tesseract.js';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ReceiptPreviewPage } from './receipt-preview/receipt-preview.page';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.page.html',
    styleUrls: ['./scan.page.scss'],
    standalone: false
})
export class ScanPage implements OnInit{
  capturedImage: string | null = null; // Image URL
  extractedText: string = ''; // Mock OCR Text
  totalAmountPaid: number = 0; // Extracted Total Amount
  invoices: Invoice[] = []; // List of invoices/receipts
  isLoading: boolean = false; // Loading indicator
  
  receipts: any[] = []; // Stores list of receipts
  newReceipt: any = { imageUrl: '', price: '' }; // Temp receipt data

  constructor(
    private db: DatabaseService,
    private router:Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController) {

  }

  ngOnInit() {
    this.fetchInvoices();
  }

  async captureInvoice() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    await this.saveInvoice(image?.dataUrl ?? '');
    console.log('Invoice saved successfully');
  }
   async captureImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
      });

      this.newReceipt.imageUrl = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  async pickFromGallery(){
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64,
      });

      this.newReceipt.imageUrl = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }
  async saveInvoice(imageUrl: string) {
    this.isLoading = true; // Show loading state
    try {
      const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
      console.log('OCR Result:', text);
  
      const extractedData = this.extractInvoiceDetails(text);
  
      const parsedInvoice: Invoice = {
        userId: 'user123',
        date: extractedData.date,
        total: extractedData.total,
        items: extractedData.items,
        imageUrl: imageUrl,
      };
  
      await this.db.saveInvoice(parsedInvoice);
      console.log('Invoice saved successfully');
      this.fetchInvoices();
    } catch (error) {
      console.error('OCR Error:', error);
      console.log('Failed to process the invoice. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }
  

/** Extract invoice details from OCR text */

extractInvoiceDetails(text: string): { date: string; total: number; items: any[]; storeName: string; taxAmount: number } {
  // Regex for capturing date
  const dateMatch = text.match(/(\d{2}[-\/]\d{2}[-\/]\d{4})|(\d{4}[-\/]\d{2}[-\/]\d{2})/);
  
  // Regex for capturing total amount (can be adjusted based on your invoice format)
  const totalMatch = text.match(/(Total Amount|Grand Total|Amount Due):\s*(\d+\.\d{2})/i);

  // Regex for capturing items (items can vary depending on the format)
  const itemsMatch = text.match(/(\d+)\s*(.*?)\s*(\d+\.\d{2})/g);

  // Regex for capturing tax information (if available)
  const taxMatch = text.match(/Tax:\s*(\d+\.\d{2})/i);
  
  // Regex for capturing store name (you may need to refine this based on your invoice format)
  const storeMatch = text.match(/Store Name:\s*(.*?)\n/i);

  // Extract items (quantity, description, price)
  const items = itemsMatch ? itemsMatch.map(item => {
    const [quantity, description, price] = item.split(/\s+/);
    return { quantity: parseInt(quantity), description, price: parseFloat(price) };
  }) : [];

  return {
    date: dateMatch ? dateMatch[0] : new Date().toISOString(),
    total: totalMatch ? parseFloat(totalMatch[2]) : 0,
    items: items,
    storeName: storeMatch ? storeMatch[1] : 'Unknown Store', // Default value if not found
    taxAmount: taxMatch ? parseFloat(taxMatch[1]) : 0 // Default value if tax is not found
  };
}





  /** Fetch invoices from PouchDB */
  async fetchInvoices() {
    this.invoices = await this.db.getInvoices();
    console.log('Fetched Invoices',this.invoices);
  }
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000, // Display for 2 seconds
      position: 'bottom',
      color: color, // Use 'success', 'danger', or other Ionic colors
    });
    toast.present();
  }

  async deleteInvoice(invoiceId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this invoice?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              // Delete the invoice from the database
              await this.db.deleteInvoice(invoiceId);
              console.log('Invoice deleted successfully');
  
              // Show a success message to the user
              this.showToast('Invoice deleted successfully!', 'success');
  
              // Refresh the list of invoices
              this.fetchInvoices();
            } catch (error) {
              console.error('Error deleting invoice:', error);
  
              // Show an error message to the user
              this.showToast('Failed to delete invoice. Please try again.', 'danger');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  async saveReceipt() {
    if (!this.newReceipt.imageUrl || !this.newReceipt.price) {
      alert('Please select an image and enter a price.');
      return;
    }

    const receiptData = {
      id: new Date().toISOString(),
      imageUrl: this.newReceipt.imageUrl,
      price: this.newReceipt.price,
    };

    await this.db.addReceipt(receiptData);
    this.loadReceipts(); // Reload list
    this.newReceipt = { imageUrl: '', price: '' }; // Reset form
  }

  async loadReceipts() {
    this.receipts = await this.db.getAllReceipts();
  }

  async deleteReceipt(id: string) {
    await this.db.deleteReceipt(id);
    this.loadReceipts();
  }

  ionViewWillEnter() {
    this.loadReceipts();
  }

  async openPreview(imageUrl: string) {
    const modal = await this.modalCtrl.create({
      component: ReceiptPreviewPage,
      componentProps: { imageUrl },
    });
    await modal.present();
  }

}