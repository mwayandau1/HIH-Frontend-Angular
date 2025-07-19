import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MedicationsPageComponent } from './medications.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MedicationsComponent', () => {
  let component: MedicationsPageComponent;
  let fixture: ComponentFixture<MedicationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationsPageComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
