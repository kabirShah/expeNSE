import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDebitPage } from './edit-debit.page';

describe('EditDebitPage', () => {
  let component: EditDebitPage;
  let fixture: ComponentFixture<EditDebitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDebitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
