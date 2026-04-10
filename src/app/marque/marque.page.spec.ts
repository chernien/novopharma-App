import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarquePage } from './marque.page';

describe('MarquePage', () => {
  let component: MarquePage;
  let fixture: ComponentFixture<MarquePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
