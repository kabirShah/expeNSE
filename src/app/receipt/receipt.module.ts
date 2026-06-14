import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

// Pages
import { ReceiptListPage } from './pages/receipt-list/receipt-list.page';
import { ReceiptUploadPage } from './pages/receipt-upload/receipt-upload.page';
import { ReceiptDetailsPage } from './pages/receipt-details/receipt-details.page';
import { ReceiptReviewPage } from './pages/receipt-review/receipt-review.page';
import { ReceiptEditPage } from './receipt-edit.page';

// Components
import { ReceiptCardComponent } from './receipt-card.component';
import { ReceiptPreviewComponent } from './receipt-preview.component';
import { ReceiptEditorComponent } from './receipt-editor.component';
import { ReceiptItemEditorComponent } from './receipt-item-editor.component';

// Services
import { ReceiptService } from '../services/receipt.service';
import { ReceiptHttpService } from '../services/receipt-http.service';
import { ReceiptStateService } from '../services/receipt-state.service';

// Routes Configuration
const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ReceiptListPage, data: { title: 'Receipts' } },
      { path: 'upload', component: ReceiptUploadPage, data: { title: 'Upload Receipt' } },
      { path: 'details/:id', component: ReceiptDetailsPage, data: { title: 'Receipt Details' } },
      { path: 'review/:id', component: ReceiptReviewPage, data: { title: 'Review Receipt' } },
    ],
  },
];

@NgModule({
  declarations: [
    ReceiptListPage,
    ReceiptUploadPage,
    ReceiptDetailsPage,
    ReceiptReviewPage,
    ReceiptEditPage,
    ReceiptCardComponent,
    ReceiptPreviewComponent,
    ReceiptEditorComponent,
    ReceiptItemEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    ReceiptService,
    ReceiptHttpService,
    ReceiptStateService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReceiptModule {}