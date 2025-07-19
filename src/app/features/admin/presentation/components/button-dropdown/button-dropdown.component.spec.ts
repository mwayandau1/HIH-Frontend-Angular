import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonDropdownComponent } from './button-dropdown.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DropdownItem } from '@shared/models/dropdown';

describe('ButtonDropdownComponent', () => {
  let component: ButtonDropdownComponent;
  let fixture: ComponentFixture<ButtonDropdownComponent>;

  const mockOptions: DropdownItem[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonDropdownComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonDropdownComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should assign dropdownContainer via ViewChild', () => {
    fixture.detectChanges();
    expect(component.dropdownContainer).toBeDefined();
    expect(component.dropdownContainer.nativeElement).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component['isOpen']).toBeFalsy();
    expect(component['arrow']).toBeDefined();
  });

  it('should toggle dropdown when button is clicked', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(component['isOpen']).toBeFalsy();

    button.triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(component['isOpen']).toBeTruthy();

    button.triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(component['isOpen']).toBeFalsy();
  });

  it('should render all options when dropdown is open', () => {
    component['isOpen'] = true;
    fixture.detectChanges();
    fixture.componentRef.setInput('clearId', 'Clear Option');

    fixture.detectChanges();

    const optionButtons = fixture.debugElement.queryAll(By.css('button[role="menuitem"]'));
    expect(optionButtons.length).toBe(mockOptions.length + 1);

    expect(optionButtons[0].nativeElement.textContent.trim()).toBe('Clear Option');
    expect(optionButtons[1].nativeElement.textContent.trim()).toBe(mockOptions[0].label);
    expect(optionButtons[2].nativeElement.textContent.trim()).toBe(mockOptions[1].label);
    expect(optionButtons[3].nativeElement.textContent.trim()).toBe(mockOptions[2].label);
  });

  it('should emit selected item id and close dropdown when item is selected', () => {
    const itemSelectedSpy = jest.spyOn(component.itemSelected, 'emit');
    component['isOpen'] = true;
    fixture.detectChanges();

    component['selectItem'](mockOptions[0]);

    expect(itemSelectedSpy).toHaveBeenCalledWith(mockOptions[0].id);
    expect(component['isOpen']).toBeFalsy();
  });

  it('should close dropdown when clicking outside', () => {
    component['isOpen'] = true;
    fixture.detectChanges();
    expect(component['isOpen']).toBeTruthy();

    // Simulate click outside
    const outsideClick = new MouseEvent('click');
    document.dispatchEvent(outsideClick);
    fixture.detectChanges();

    expect(component['isOpen']).toBeFalsy();
  });

  it('should not close dropdown when clicking inside', () => {
    // Open dropdown
    component['isOpen'] = true;
    fixture.detectChanges();
    expect(component['isOpen']).toBeTruthy();

    // Simulate click inside
    const insideClick = new MouseEvent('click');
    Object.defineProperty(insideClick, 'target', {
      value: component.dropdownContainer.nativeElement,
    });
    document.dispatchEvent(insideClick);
    fixture.detectChanges();

    expect(component['isOpen']).toBeTruthy();
  });

  it('should rotate arrow icon when dropdown is open', () => {
    const button = fixture.debugElement.query(By.css('button'));
    const arrowContainer = fixture.debugElement.query(By.css('.w-full.h-4'));

    // Initial state
    expect(arrowContainer.nativeElement.classList.contains('rotate-180')).toBeFalsy();

    // Open dropdown
    button.triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(arrowContainer.nativeElement.classList.contains('rotate-180')).toBeTruthy();

    // Close dropdown
    button.triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(arrowContainer.nativeElement.classList.contains('rotate-180')).toBeFalsy();
  });

  it('should handle empty options array', () => {
    // Create a new component instance with empty options
    const emptyFixture = TestBed.createComponent(ButtonDropdownComponent);
    const emptyComponent = emptyFixture.componentInstance;
    Object.defineProperty(emptyComponent.options, 'value', {
      get: () => [],
      configurable: true,
    });
    emptyComponent['isOpen'] = true;
    emptyFixture.detectChanges();

    emptyFixture.detectChanges();

    const optionButtons = emptyFixture.debugElement.queryAll(By.css('button[role="menuitem"]'));
    expect(optionButtons.length).toBe(1);
  });
});
