import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpensesPreviewPage } from './expenses-preview.page';

describe('ExpensesPreviewPage', () => {
  let component: ExpensesPreviewPage;
  let fixture: ComponentFixture<ExpensesPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
