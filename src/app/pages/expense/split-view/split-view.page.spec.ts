import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitViewPage } from './split-view.page';

describe('SplitViewPage', () => {
  let component: SplitViewPage;
  let fixture: ComponentFixture<SplitViewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
