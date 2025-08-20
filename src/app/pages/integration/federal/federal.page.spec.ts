import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FederalPage } from './federal.page';

describe('FederalPage', () => {
  let component: FederalPage;
  let fixture: ComponentFixture<FederalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FederalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
