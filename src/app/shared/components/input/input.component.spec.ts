import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('control', new FormControl());

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set required input properties', () => {
    const mockId = 'test-input';
    const mockLabel = 'Test Label';
    const mockType = 'email';
    const mockClassName = 'custom-class';
    const mockPlaceholder = 'Enter text';
    const mockControl = new FormControl();
    const mockErrorMessage = 'Invalid input';
    const mockRequired = true;
    const mockIsDisabled = true;

    fixture.componentRef.setInput('id', mockId);
    fixture.componentRef.setInput('label', mockLabel);
    fixture.componentRef.setInput('type', mockType);
    fixture.componentRef.setInput('className', mockClassName);
    fixture.componentRef.setInput('placeholder', mockPlaceholder);
    fixture.componentRef.setInput('control', mockControl);
    fixture.componentRef.setInput('errorMessage', mockErrorMessage);
    fixture.componentRef.setInput('required', mockRequired);
    fixture.componentRef.setInput('isDisabled', mockIsDisabled);

    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input'));
    const labelElement = fixture.debugElement.query(By.css('label'));

    expect(inputElement.nativeElement.id).toBe(mockId);
    expect(labelElement.nativeElement.textContent.trim()).toBe('Test Label *');
    expect(inputElement.nativeElement.type).toBe(mockType);
    expect(inputElement.nativeElement.placeholder).toBe(mockPlaceholder);
    expect(inputElement.nativeElement.classList.contains('bg-gray-100')).toBe(mockIsDisabled);
    expect(inputElement.nativeElement.classList.contains('cursor-not-allowed')).toBe(
      mockIsDisabled,
    );
    expect(inputElement.nativeElement.classList.contains('opacity-50')).toBe(mockIsDisabled);
    expect(fixture.debugElement.query(By.css('span.text-red-700'))).toBeTruthy();
  });

  it('should handle icon positioning', () => {
    fixture.componentRef.setInput('hasIcon', true);
    fixture.componentRef.setInput('iconPosition', 'right');
    fixture.componentRef.setInput('id', 'test-input');
    fixture.componentRef.setInput('label', 'Test Label');

    fixture.detectChanges();

    const iconContainer = fixture.debugElement.query(By.css('.absolute'));
    expect(iconContainer.nativeElement.classList.contains('right-4')).toBeTruthy();
    expect(iconContainer.nativeElement.classList.contains('left-4')).toBeFalsy();
  });

  it('should emit blur event', () => {
    fixture.componentRef.setInput('id', 'test-input');
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input'));
    const mockEvent = new FocusEvent('blur');
    const emitSpy = jest.spyOn(component.inputBlur, 'emit');

    inputElement.triggerEventHandler('blur', mockEvent);
    expect(emitSpy).toHaveBeenCalledWith(mockEvent);
  });

  it('should show error message when provided', () => {
    const mockErrorMessage = 'This field is required';
    fixture.componentRef.setInput('errorMessage', mockErrorMessage);
    fixture.componentRef.setInput('id', 'test-input');
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('span.text-red-700'));
    expect(errorElement.nativeElement.textContent.trim()).toBe(mockErrorMessage);
  });

  it('should apply custom class name', () => {
    const mockClassName = 'custom-class';
    fixture.componentRef.setInput('id', 'test-input');
    fixture.componentRef.setInput('className', mockClassName);
    fixture.detectChanges();

    const containerElement = fixture.debugElement.query(By.css('.flex.flex-col'));
    expect(containerElement.nativeElement.classList.contains(mockClassName)).toBeTruthy();
  });

  it('should handle disabled state', () => {
    fixture.componentRef.setInput('id', 'test-input');
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input'));
    const labelElement = fixture.debugElement.query(By.css('label'));

    expect(inputElement.nativeElement.classList.contains('bg-gray-100')).toBeTruthy();
    expect(inputElement.nativeElement.classList.contains('cursor-not-allowed')).toBeTruthy();
    expect(inputElement.nativeElement.classList.contains('opacity-50')).toBeTruthy();
    expect(labelElement.nativeElement.classList.contains('opacity-50')).toBeTruthy();
  });

  it('should show required indicator when required is true', () => {
    fixture.componentRef.setInput('id', 'test-input');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('Test Label *');
  });

  it('should not show required indicator when required is false', () => {
    fixture.componentRef.setInput('id', 'test-input');
    fixture.componentRef.setInput('required', false);
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('Test Label');
  });

  describe('handleKeyEvent', () => {
    it('should emit keyEvent when Enter key is pressed', () => {
      fixture.componentRef.setInput('id', 'test-input');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input'));
      const emitSpy = jest.spyOn(component.keyEvent, 'emit');
      const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });

      inputElement.nativeElement.dispatchEvent(mockEvent);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not emit keyEvent when other keys are pressed', () => {
      fixture.componentRef.setInput('id', 'test-input');
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('input'));
      const emitSpy = jest.spyOn(component.keyEvent, 'emit');
      const mockEvent = new KeyboardEvent('keydown', { key: 'Space' });

      inputElement.nativeElement.dispatchEvent(mockEvent);
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
