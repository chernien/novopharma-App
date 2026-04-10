import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DermosPage } from './dermos.page';

describe('DermosPage', () => {
  let component: DermosPage;
  let fixture: ComponentFixture<DermosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DermosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
