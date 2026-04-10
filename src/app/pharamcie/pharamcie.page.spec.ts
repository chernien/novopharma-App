import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharamciePage } from './pharamcie.page';

describe('PharamciePage', () => {
  let component: PharamciePage;
  let fixture: ComponentFixture<PharamciePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PharamciePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
