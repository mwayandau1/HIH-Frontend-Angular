import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientMedicationsComponent } from './patient-medications.component';

describe('PatientMedicationsComponent', () => {
  let component: PatientMedicationsComponent;
  let fixture: ComponentFixture<PatientMedicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMedicationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientMedicationsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('medications', []);
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
