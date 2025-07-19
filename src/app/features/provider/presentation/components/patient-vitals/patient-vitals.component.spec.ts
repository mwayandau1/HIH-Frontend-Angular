import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientVitalsComponent } from './patient-vitals.component';
import { Vital } from '@shared/models/patient';

const mockVitals: Vital = {
  id: 1,
  height: 1.8,
  weight: 75.5,
  age: 35,
  bloodPressure: '120/80',
  heartRate: '72 bpm',
  temperature: 36.6,
  recordedAt: '2025-07-03T08:30:00.000Z',
};

describe('PatientVitalsComponent', () => {
  let component: PatientVitalsComponent;
  let fixture: ComponentFixture<PatientVitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVitalsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientVitalsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('vitals', [mockVitals]);
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
