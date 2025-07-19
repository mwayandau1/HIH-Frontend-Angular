import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlideToggleComponent } from './slide-toggle.component';
import { LucideAngularModule } from 'lucide-angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('SlideToggleComponent', () => {
  let component: SlideToggleComponent;
  let fixture: ComponentFixture<SlideToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LucideAngularModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        SlideToggleComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SlideToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isOn()).toBe(false);
      expect(component.disabled()).toBe(false);
      expect(component.variant()).toBe('primary');
    });
  });

  describe('Toggle functionality', () => {
    it('should toggle isOn state when clicked', () => {
      expect(component.isOn()).toBe(false);
      component.toggle();
      expect(component.isOn()).toBe(true);
      component.toggle();
      expect(component.isOn()).toBe(false);
    });

    it('should emit toggled event with current state', () => {
      jest.spyOn(component.toggled, 'emit');
      component.toggle();
      expect(component.toggled.emit).toHaveBeenCalledWith(true);
      component.toggle();
      expect(component.toggled.emit).toHaveBeenCalledWith(false);
    });

    it('should not toggle when disabled', () => {
      component.disabled.set(true);
      component.toggle();
      expect(component.isOn()).toBe(false);
    });
  });

  describe('ControlValueAccessor implementation', () => {
    it('should write value', () => {
      component.writeValue(true);
      expect(component.isOn()).toBe(true);
      component.writeValue(false);
      expect(component.isOn()).toBe(false);
    });

    it('should register onChange function', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);
      component.toggle();
      expect(mockFn).toHaveBeenCalledWith(true);
    });

    it('should register onTouched function', () => {
      const mockFn = jest.fn();
      component.registerOnTouched(mockFn);
      component.toggle();
      expect(mockFn).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled()).toBe(true);
      component.setDisabledState(false);
      expect(component.disabled()).toBe(false);
    });
  });

  describe('Variant classes', () => {
    const variants = ['primary', 'primary-icon', 'secondary', 'secondary-icon'] as const;

    it.each(variants)('should return correct classes for %s variant', (variant) => {
      fixture.componentRef.setInput('variant', variant);
      const classes = component['getVariantClasses']();
      expect(classes.track).toContain(
        variant.includes('primary') ? 'w-[40px] h-[12px]' : 'w-[40px] h-[20px]',
      );
      expect(classes.thumb).toContain(
        variant.includes('primary') ? 'w-[20px] h-[20px]' : 'w-[16px] h-[16px]',
      );
      expect(classes.showIcon).toBe(variant.includes('icon'));
    });

    it('should update classes based on isOn state', () => {
      fixture.componentRef.setInput('variant', 'primary');

      // Test off state
      component.isOn.set(false);
      let classes = component['getVariantClasses']();
      expect(classes.thumb).toContain('translate-x-0');
      expect(classes.thumb).toContain('bg-[#BBC5CB]');

      // Test on state
      component.isOn.set(true);
      classes = component['getVariantClasses']();
      expect(classes.thumb).toContain('translate-x-6');
      expect(classes.thumb).toContain('bg-[#5570F1]');
    });
  });

  describe('Icon handling', () => {
    it('should return check icon when isOn is true', () => {
      component.isOn.set(true);
      expect(component['getIcon']()).toBe(component['checkIcon']);
    });

    it('should return cross icon when isOn is false', () => {
      component.isOn.set(false);
      expect(component['getIcon']()).toBe(component['crossIcon']);
    });
  });
});
