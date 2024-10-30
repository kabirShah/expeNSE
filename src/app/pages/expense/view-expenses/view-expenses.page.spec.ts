import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewExpensesPage } from './view-expenses.page';

describe('ViewExpensesPage', () => {
  let component: ViewExpensesPage;
  let fixture: ComponentFixture<ViewExpensesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
