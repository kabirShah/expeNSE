import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebitPage } from './debit.page';

describe('DebitPage', () => {
  let component: DebitPage;
  let fixture: ComponentFixture<DebitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DebitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
