import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImmunizationPageComponent } from './immunization-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImmunizationPageComponent', () => {
  let component: ImmunizationPageComponent;
  let fixture: ComponentFixture<ImmunizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmunizationPageComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ImmunizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
