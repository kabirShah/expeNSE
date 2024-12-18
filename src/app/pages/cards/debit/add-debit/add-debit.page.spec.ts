import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDebitPage } from './add-debit.page';

describe('AddDebitPage', () => {
  let component: AddDebitPage;
  let fixture: ComponentFixture<AddDebitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDebitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
