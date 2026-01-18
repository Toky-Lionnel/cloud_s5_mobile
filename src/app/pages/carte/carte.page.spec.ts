import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartePage } from './carte.page';

describe('CartePage', () => {
  let component: CartePage;
  let fixture: ComponentFixture<CartePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CartePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
