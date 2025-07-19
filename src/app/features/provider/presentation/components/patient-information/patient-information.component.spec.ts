import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientInformationComponent } from './patient-information.component';
import { PatientDetails } from '@shared/models/patient';
import { Gender } from '@shared/models';

export const mockPatient: PatientDetails = {
  id: 'p12345',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  address: '123 Health Street, Wellness City, GH',
  gender: Gender.Male,
  phoneNumber: '+233201234567',
  dateOfBirth: '1990-03-15',
  emergencyContact: 'Jane Doe - +233501234567',
  allergies: [
    {
      id: 1,
      substance: 'Peanuts',
      reaction: 'Anaphylaxis',
      severity: 'Severe',
    },
  ],
  medications: [
    {
      id: 1,
      prescribedBy: 'Dr. Smith',
      medicationName: 'Atorvastatin',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2025-01-10T08:00:00.000Z',
      endDate: '2025-12-10T08:00:00.000Z',
    },
  ],
  immunizations: [
    {
      id: 1,
      vaccineName: 'COVID-19 Vaccine',
      dateAdministered: '2023-04-05T10:00:00.000Z',
      doseNumber: '2',
    },
  ],
  consents: [
    {
      id: 1,
      providerId: 'prov987',
      consentGiven: true,
      consentedOn: '2025-06-20T14:30:00.000Z',
    },
  ],
  labResults: [
    {
      id: 1,
      labTest: 'Blood Glucose',
      value: '90',
      unit: 'mg/dL',
      resultDate: '2025-06-15T09:00:00.000Z',
      referenceRange: '70-110',
      status: 'Normal',
      notes: 'No concerns.',
    },
  ],
  medInformations: {
    id: 1,
    primaryPhysician: 'Dr. Smith',
    bloodType: 'O',
    rhFactor: 'Positive',
    medicalHistory: 'Hypertension',
    familyMedicalHistory: 'Diabetes',
    geneticDisorders: 'None',
    sexAtBirth: Gender.Male,
  },
  vitals: [
    {
      id: 1,
      height: 1.8,
      weight: 75.5,
      age: 35,
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      temperature: 36.6,
      recordedAt: '2025-07-03T08:30:00.000Z',
    },
  ],
  conditions: [
    {
      id: 1,
      conditionName: 'Hypertension',
      description: 'High blood pressure',
      severity: 'Moderate',
      treatmentPlan: 'Daily medication and lifestyle changes',
      diagnosisDate: '2022-01-12T00:00:00.000Z',
      notes: 'Under control with meds.',
    },
  ],
  visits: [
    {
      date: '2025-07-04T09:00:00.000Z',
      type: 'Check-up',
      visitNotes: 'Discussed medication side effects.',
      doctor: 'Dr. Phil',
    },
  ],
  insurance: {
    id: 1,
    provider: 'Ghana Health Insurance Corp.',
    insuranceId: 'GHIC-2025-004321',
    patientId: 'p12345',
  },
};

describe('PatientInformationComponent', () => {
  let component: PatientInformationComponent;
  let fixture: ComponentFixture<PatientInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientInformationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('patient', mockPatient);
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
