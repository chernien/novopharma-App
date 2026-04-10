import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacturePage } from './facture.page';

describe('FacturePage', () => {
  let component: FacturePage;
  let fixture: ComponentFixture<FacturePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
