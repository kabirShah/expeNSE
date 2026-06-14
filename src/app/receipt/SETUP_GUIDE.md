# Receipt Module - Setup & Integration Guide

## ✅ Quick Start Checklist

### 1. Install Dependencies
```bash
npm install @capacitor/camera @capacitor/filesystem @capacitor/network
npm install @capacitor/preferences @capawesome/capacitor-file-picker
npx cap sync
```

### 2. Environment Configuration
Update `src/environments/environment.ts` and `environment.prod.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000', // Your backend URL
};
```

### 3. Update App Routing
In `src/app/app-routing.module.ts`, add:
```typescript
{
  path: 'receipts',
  loadChildren: () => import('./receipt/receipt.module').then(m => m.ReceiptModule),
}
```

### 4. Set Up Permissions

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS (`ios/App/App/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture receipts</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to select receipt images</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need permission to save receipt photos</string>
```

---

## 📁 File Structure

```
receipt/
├── models/
│   └── receipt.model.ts              # All TypeScript interfaces & types
├── services/
│   ├── receipt-http.service.ts       # HTTP API communication
│   ├── receipt-state.service.ts      # State management
│   └── receipt.service.ts            # Main facade service
├── pages/
│   ├── receipt-list/
│   │   ├── receipt-list.page.ts
│   │   ├── receipt-list.page.html
│   │   └── receipt-list.page.scss
│   ├── receipt-upload/
│   │   ├── receipt-upload.page.ts
│   │   ├── receipt-upload.page.html
│   │   └── receipt-upload.page.scss
│   ├── receipt-details/
│   │   ├── receipt-details.page.ts
│   │   ├── receipt-details.page.html
│   │   └── receipt-details.page.scss
│   └── receipt-review/
│       ├── receipt-review.page.ts
│       ├── receipt-review.page.html
│       └── receipt-review.page.scss
├── components/
│   └── receipt-card/
│       ├── receipt-card.component.ts
│       ├── receipt-card.component.html
│       └── receipt-card.component.scss
└── receipt.module.ts
```

---

## 🔌 API Endpoints

### List Receipts
```http
GET /api/receipts?page=1&per_page=20&status=review&search=Starbucks
```

**Query Parameters:**
- `page` (int) - Page number
- `per_page` (int, max 50) - Items per page
- `search` (string) - Search merchant name
- `status` (string) - Filter by status
- `receipt_type` (string) - Filter by type
- `category_id` (int) - Filter by category
- `date_from` (date) - Start date
- `date_to` (date) - End date
- `requires_review` (bool) - Show only requiring review

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "merchant": "Starbucks",
      "receipt_type": "restaurant",
      "status": "review",
      "total": 250.50,
      "receipt_date": "2026-05-27",
      "requires_review": true,
      "items": []
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "total": 98
  }
}
```

### Upload Receipt
```http
POST /api/receipts (multipart/form-data)
```

**Form Fields:**
- `file` (File, required) - Receipt image/PDF
- `additional_files[]` (File[], optional) - Multi-page receipts
- `title` (string, optional) - Custom title
- `notes` (string, optional) - Custom notes

**Response:**
```json
{
  "message": "Receipt uploaded. Processing in background.",
  "data": {
    "id": 1,
    "status": "processing",
    "ocr_confidence": 0
  }
}
```

### Get Receipt Details
```http
GET /api/receipts/{id}
```

**Response:**
```json
{
  "id": 1,
  "merchant": "Starbucks",
  "receipt_type": "restaurant",
  "status": "review",
  "total": 250.50,
  "subtotal": 240.00,
  "tax": 10.50,
  "ocr_confidence": 92.5,
  "items": [
    {
      "name": "Coffee",
      "qty": 2,
      "unit_price": 120,
      "total": 240
    }
  ],
  "parsed_json": {}
}
```

### Confirm Receipt
```http
POST /api/receipts/{id}/confirm
```

### Create Expense
```http
POST /api/receipts/{id}/expense
Body: { "account_id": 5, "category_id": 2 }
```

### Reprocess OCR
```http
POST /api/receipts/{id}/parse
```

### Poll Status
```http
GET /api/receipts/{id}/status
```

### Get Signed Image URL
```http
GET /api/receipts/{id}/image?type=processed
```

### Get Analytics
```http
GET /api/receipts/analytics?period=month
```

---

## 🎯 Usage Examples

### List Receipts with Filters
```typescript
import { ReceiptService } from './receipt/services/receipt.service';

constructor(private receiptService: ReceiptService) {}

loadReceipts() {
  this.receiptService.getReceipts({
    page: 1,
    per_page: 20,
    status: 'review',
    search: 'grocery'
  }).subscribe({
    next: (response) => {
      console.log(response.data);
    },
    error: (error) => {
      console.error('Failed to load', error);
    }
  });
}
```

### Upload Receipt with Progress
```typescript
uploadFile(files: File[]) {
  this.receiptService.uploadReceiptWithProgress(
    files,
    (progress) => {
      console.log(`Upload progress: ${progress}%`);
    },
    { title: 'Grocery Shopping' }
  ).subscribe({
    next: (response) => {
      console.log('Upload complete:', response.data);
    },
    error: (error) => {
      console.error('Upload failed', error);
    }
  });
}
```

### Get Receipt Details
```typescript
viewReceipt(id: number) {
  this.receiptService.getReceipt(id).subscribe({
    next: (receipt) => {
      console.log('Receipt:', receipt);
      console.log('Items:', receipt.items);
      console.log('Total:', receipt.total);
    },
    error: (error) => {
      console.error('Failed to load', error);
    }
  });
}
```

### Confirm & Create Expense
```typescript
confirmAndCreate(receiptId: number) {
  // First confirm
  this.receiptService.confirmReceipt(receiptId).subscribe({
    next: () => {
      // Then create expense
      this.receiptService.createExpense(receiptId, {
        category_id: 2,
        account_id: 5
      }).subscribe({
        next: (response) => {
          console.log('Expense created:', response.data.expense_id);
        }
      });
    }
  });
}
```

### Handle Offline
```typescript
// Monitor network status
this.receiptService.getOnlineStatus().subscribe(isOnline => {
  if (isOnline) {
    console.log('Back online - syncing...');
    this.receiptService.syncOfflineQueue();
  }
});

// Check offline queue
this.receiptService.getOfflineQueue().subscribe(queue => {
  const pending = queue.filter(q => q.status === 'pending');
  console.log(`${pending.length} items queued`);
});
```

---

## 🧪 Testing

### Test Checklist
- [ ] List receipts with search
- [ ] Filter by status
- [ ] Filter by type
- [ ] Upload single file
- [ ] Upload multiple files
- [ ] View receipt details
- [ ] Confirm receipt
- [ ] Create expense
- [ ] Delete receipt
- [ ] Test offline mode
- [ ] Test online sync
- [ ] Test network transition

### Mock API Responses

Create `src/app/receipt/mocks/receipt.mock.ts`:
```typescript
export const MOCK_RECEIPTS = [
  {
    id: 1,
    merchant: 'Starbucks',
    receipt_type: 'restaurant',
    status: 'review',
    total: 250.50,
    receipt_date: '2026-05-27',
    requires_review: true,
    items: [
      { name: 'Coffee', qty: 2, unit_price: 120, total: 240 }
    ]
  }
];
```

---

## 🔧 Troubleshooting

### Camera/Gallery Not Working
- Check Android/iOS permissions in manifests
- Verify Capacitor is synced: `npx cap sync`
- Test on actual device (not emulator for camera)

### Uploads Failing
- Verify backend is running
- Check API URL in environment.ts
- Verify file size limits (max 25MB each)
- Check CORS settings on backend

### Offline Queue Not Syncing
- Ensure Preferences plugin installed
- Check browser console for errors
- Manually trigger: `receiptService.syncOfflineQueue()`

### OCR Not Processing
- Verify backend queue is running
- Check job logs: `php artisan queue:work`
- Verify ProcessReceiptOCRJob exists
- Check ProcessReceiptOCRJob dependencies

### Image URLs Returning 404
- Verify image storage path on backend
- Check Laravel storage:link
- Verify S3 config if using cloud storage

---

## 📊 Performance Optimization

### Caching Strategy
```typescript
// HTTP responses are cached for 1 minute
// State is cached in Preferences for offline access
// Images are cached by browser
```

### Bundle Size
```
Models:     ~5KB
Services:   ~15KB
Pages:      ~25KB
Total:      ~45KB (gzipped)
```

### Lazy Loading
Receipts module is lazy-loaded by default via routing.

---

## 🚀 Production Deployment

1. **Build:**
   ```bash
   npm run build -- --prod
   ```

2. **Environment:**
   ```typescript
   // environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: 'https://api.yourapp.com',
   };
   ```

3. **Deploy:**
   ```bash
   npx cap build android  # For Android
   npx cap build ios      # For iOS
   ```

---

## 📝 License

MIT

---

## 🤝 Support

For issues or questions, check the console logs and verify:
1. Backend API is running
2. Environment URL is correct
3. Permissions are granted
4. Capacitor is synced
