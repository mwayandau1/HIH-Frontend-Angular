import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './custom-checkbox.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, CommonModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.control()).toBeNull();
    expect(component.disabled()).toBeFalsy();
  });

  describe('Toggle functionality', () => {
    it('should toggle value when clicked', () => {
      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.toggle();
      expect(formControl.value).toBeTruthy();

      component.toggle();
      expect(formControl.value).toBeFalsy();
    });

    it('should not toggle when disabled', () => {
      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.setDisabledState(true);
      component.toggle();
      expect(formControl.value).toBeFalsy();
    });
  });

  describe('Form Control Integration', () => {
    it('should write value to form control', () => {
      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.writeValue(true);
      expect(formControl.value).toBeTruthy();

      component.writeValue(false);
      expect(formControl.value).toBeFalsy();
    });

    it('should handle disabled state correctly', () => {
      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.setDisabledState(true);
      expect(component.disabled()).toBeTruthy();
      expect(formControl.disabled).toBeTruthy();

      component.setDisabledState(false);
      expect(component.disabled()).toBeFalsy();
      expect(formControl.disabled).toBeFalsy();
    });

    it('should call onChange and onTouched when toggled', () => {
      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      const onChangeSpy = jest.spyOn(component as unknown as { onChange: () => void }, 'onChange');
      const onTouchedSpy = jest.spyOn(
        component as unknown as { onTouched: () => void },
        'onTouched',
      );

      component.toggle();

      expect(onChangeSpy).toHaveBeenCalledWith(true);
      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null form control gracefully', () => {
      Object.defineProperty(component, 'control', {
        get: () => () => null,
      });

      expect(() => {
        component.toggle();
        component.writeValue(true);
        component.setDisabledState(true);
      }).not.toThrow();
    });

    it('should handle undefined form control value', () => {
      const formControl = new FormControl(undefined);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.writeValue(true);
      expect(formControl.value).toBeTruthy();
    });

    it('should maintain state when writeValue is called with same value', () => {
      const formControl = new FormControl(true);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.writeValue(true);
      expect(formControl.value).toBeTruthy();
    });
  });

  describe('Control Value Accessor', () => {
    it('should register onChange callback', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);

      component.toggle();

      expect(mockFn).toHaveBeenCalledWith(true);
    });

    it('should register onTouched callback', () => {
      const mockFn = jest.fn();
      component.registerOnTouched(mockFn);

      component.toggle();

      expect(mockFn).toHaveBeenCalled();
    });

    it('should use registered onChange instead of default', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);

      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.toggle();

      expect(mockFn).toHaveBeenCalledWith(true);
      expect(formControl.value).toBe(false);
    });

    it('should use registered onTouched instead of default', () => {
      const mockFn = jest.fn();
      component.registerOnTouched(mockFn);

      const formControl = new FormControl(false);
      Object.defineProperty(component, 'control', {
        get: () => () => formControl,
      });

      component.toggle();

      expect(mockFn).toHaveBeenCalled();
      expect(formControl.touched).toBe(false);
    });
  });
});
