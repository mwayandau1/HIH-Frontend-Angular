import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaincePageComponent } from './complaince.component';

describe('ComplaincePageComponent', () => {
  let component: ComplaincePageComponent;
  let fixture: ComponentFixture<ComplaincePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaincePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaincePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the complaince page', () => {
    expect(component).toBeTruthy();
  });
});
