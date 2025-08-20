import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RBLPage } from './rbl.page';

describe('RBLPage', () => {
  let component: RBLPage;
  let fixture: ComponentFixture<RBLPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RBLPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
