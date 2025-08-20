import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KotakPage } from './kotak.page';

describe('KotakPage', () => {
  let component: KotakPage;
  let fixture: ComponentFixture<KotakPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KotakPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
