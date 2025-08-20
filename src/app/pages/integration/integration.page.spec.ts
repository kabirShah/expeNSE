import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationPage } from './integration.page';

describe('IntegrationPage', () => {
  let component: IntegrationPage;
  let fixture: ComponentFixture<IntegrationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
