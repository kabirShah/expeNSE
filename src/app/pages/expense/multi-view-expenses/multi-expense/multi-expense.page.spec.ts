import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropExpensePage } from './multi-expense.page';

describe('DropExpensePage', () => {
  let component: DropExpensePage;
  let fixture: ComponentFixture<DropExpensePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DropExpensePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
