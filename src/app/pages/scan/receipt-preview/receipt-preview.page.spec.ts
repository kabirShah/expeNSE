import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptPreviewPage } from './receipt-preview.page';

describe('ReceiptPreviewPage', () => {
  let component: ReceiptPreviewPage;
  let fixture: ComponentFixture<ReceiptPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
