import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewDropPage } from './view-drop.page';

describe('ViewDropPage', () => {
  let component: ViewDropPage;
  let fixture: ComponentFixture<ViewDropPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDropPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
