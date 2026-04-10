import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommandePage } from './recommande.page';

describe('RecommandePage', () => {
  let component: RecommandePage;
  let fixture: ComponentFixture<RecommandePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommandePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
