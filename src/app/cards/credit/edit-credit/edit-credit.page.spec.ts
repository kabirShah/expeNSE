import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCreditPage } from './edit-credit.page';

describe('EditCreditPage', () => {
  let component: EditCreditPage;
  let fixture: ComponentFixture<EditCreditPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCreditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
