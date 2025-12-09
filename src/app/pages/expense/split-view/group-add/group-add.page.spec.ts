import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupAddPage } from './group-add.page';

describe('GroupAddPage', () => {
  let component: GroupAddPage;
  let fixture: ComponentFixture<GroupAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
