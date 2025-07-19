import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectInputComponent } from './select-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DropdownItem } from '@shared/models';
import { DOCUMENT } from '@angular/common';

describe('SelectInputComponent', () => {
  let component: SelectInputComponent;
  let fixture: ComponentFixture<SelectInputComponent>;
  let documentMock: Document;

  const options: DropdownItem[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
  ];

  beforeEach(async () => {
    documentMock = document;
    await TestBed.configureTestingModule({
      imports: [SelectInputComponent, ReactiveFormsModule],
      providers: [{ provide: DOCUMENT, useValue: documentMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use placeholder when no value is selected', () => {
    fixture.componentRef.setInput('placeholder', 'Pick one');
    component.controlValue.set('');
    expect(component.selectedLabel()).toBe('Pick one');
  });

  it('should display selected option label', () => {
    component.controlValue.set('2');
    expect(component.selectedLabel()).toBe('Option 2');
  });

  it('should toggle dropdown open/close', () => {
    expect(component.isOpen()).toBe(false);
    component.toggleDropdown();
    expect(component.isOpen()).toBe(true);
    component.toggleDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should not open dropdown if disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    component.toggleDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should select option and close dropdown', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    component.isOpen.set(true);
    component.selectOption('1');
    expect(control.value).toBe('1');
    expect(component.isOpen()).toBe(false);
  });

  it('should close dropdown when closeDropdown is called', () => {
    component.isOpen.set(true);
    component.closeDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should update controlValue when control value changes', () => {
    const control = new FormControl('2');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    control.setValue('1');
    expect(component.controlValue()).toBe('1');
  });

  it('should close dropdown when clicking outside', () => {
    component.isOpen.set(true);
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: document.createElement('div') });
    documentMock.dispatchEvent(event);
    expect(component.isOpen()).toBe(false);
  });

  it('should not close dropdown when clicking inside', () => {
    component.isOpen.set(true);
    const insideElement = document.createElement('app-select-input');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: insideElement });
    documentMock.dispatchEvent(event);
    expect(component.isOpen()).toBe(true);
  });
});
