import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddGroupExpensePage } from './add-group-expense.page';

describe('AddGroupExpensePage', () => {
  let component: AddGroupExpensePage;
  let fixture: ComponentFixture<AddGroupExpensePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroupExpensePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
