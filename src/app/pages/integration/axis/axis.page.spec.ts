import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AxisPage } from './axis.page';

describe('AxisPage', () => {
  let component: AxisPage;
  let fixture: ComponentFixture<AxisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AxisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
