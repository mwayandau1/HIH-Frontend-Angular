import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomingCallNotificationComponent } from './incoming-call.component';
import { ButtonComponent } from '@shared/components';

describe('IncomingCallNotificationComponent', () => {
  let component: IncomingCallNotificationComponent;
  let fixture: ComponentFixture<IncomingCallNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomingCallNotificationComponent, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomingCallNotificationComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('callerName', 'John Doe');
    fixture.componentRef.setInput('isVideoCall', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return initials for multi-word names', () => {
    expect(component['getInitials']('John Doe')).toBe('JD');
  });

  it('should return first letter for single-word names', () => {
    expect(component['getInitials']('Alice')).toBe('A');
  });

  it('should return empty string for empty input', () => {
    expect(component['getInitials']('')).toBe('');
  });

  it('should handle multiple spaces', () => {
    expect(component['getInitials']('John  Doe')).toBe('JD');
  });

  it('should return uppercase initials', () => {
    expect(component['getInitials']('john doe')).toBe('JD');
  });

  it('should limit to 2 characters', () => {
    expect(component['getInitials']('John Doe Smith')).toBe('JD');
  });
});
