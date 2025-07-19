import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientRecentVisitsComponent } from './patient-recent-visits.component';

describe('PatientRecentVisitsComponent', () => {
  let component: PatientRecentVisitsComponent;
  let fixture: ComponentFixture<PatientRecentVisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRecentVisitsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientRecentVisitsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visits', []);
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
