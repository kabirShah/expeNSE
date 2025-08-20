import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SBIPage } from './sbi.page';

describe('SBIPage', () => {
  let component: SBIPage;
  let fixture: ComponentFixture<SBIPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SBIPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
