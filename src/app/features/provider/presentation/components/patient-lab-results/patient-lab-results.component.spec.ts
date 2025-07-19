import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientLabResultsComponent } from './patient-lab-results.component';

describe('PatientLabResultsComponent', () => {
  let component: PatientLabResultsComponent;
  let fixture: ComponentFixture<PatientLabResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLabResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientLabResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('labResults', []);
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
