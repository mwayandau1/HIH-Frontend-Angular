import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientSummaryComponent } from './patient-summary.component';
import { mockPatient } from '../patient-information/patient-information.component.spec';

describe('PatientSummaryComponent', () => {
  let component: PatientSummaryComponent;
  let fixture: ComponentFixture<PatientSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('patient', mockPatient);
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
