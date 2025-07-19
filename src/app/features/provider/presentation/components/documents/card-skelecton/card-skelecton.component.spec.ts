import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSkelectonComponent } from './card-skelecton.component';

describe('CardSkelectonComponent', () => {
  let component: CardSkelectonComponent;
  let fixture: ComponentFixture<CardSkelectonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSkelectonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSkelectonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
