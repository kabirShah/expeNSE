import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HDFCPage } from './hdfc.page';

describe('HDFCPage', () => {
  let component: HDFCPage;
  let fixture: ComponentFixture<HDFCPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HDFCPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
