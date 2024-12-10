import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitPage } from './split.page';

describe('SplitPage', () => {
  let component: SplitPage;
  let fixture: ComponentFixture<SplitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
