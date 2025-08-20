import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ICICIPage } from './icici.page';

describe('ICICIPage', () => {
  let component: ICICIPage;
  let fixture: ComponentFixture<ICICIPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ICICIPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
