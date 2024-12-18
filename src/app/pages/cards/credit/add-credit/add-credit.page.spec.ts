import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCreditPage } from './add-credit.page';

describe('AddCreditPage', () => {
  let component: AddCreditPage;
  let fixture: ComponentFixture<AddCreditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCreditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
