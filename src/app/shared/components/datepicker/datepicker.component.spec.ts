import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './datepicker.component';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'datepicker');
    fixture.componentRef.setInput('label', 'Date');
    fixture.detectChanges();
  });

  it('should create the datepicker component', () => {
    expect(component).toBeTruthy();
  });
});
