import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LabRecordsComponent } from './lab-records.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LabRecordsComponent', () => {
  let component: LabRecordsComponent;
  let fixture: ComponentFixture<LabRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabRecordsComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LabRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
