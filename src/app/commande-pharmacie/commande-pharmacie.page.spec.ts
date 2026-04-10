import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandePharmaciePage } from './commande-pharmacie.page';

describe('CommandePharmaciePage', () => {
  let component: CommandePharmaciePage;
  let fixture: ComponentFixture<CommandePharmaciePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandePharmaciePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
