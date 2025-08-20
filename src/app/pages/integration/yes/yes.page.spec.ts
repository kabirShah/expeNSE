import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YesPage } from './yes.page';

describe('YesPage', () => {
  let component: YesPage;
  let fixture: ComponentFixture<YesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(YesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
