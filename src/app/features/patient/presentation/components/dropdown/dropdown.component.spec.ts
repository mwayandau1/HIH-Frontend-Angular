import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DropdownItem } from '@shared/models/dropdown';
import { By } from '@angular/platform-browser';

describe('DropdownComponent', () => {
  const mockOptions: DropdownItem[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with ViewChild and default state', () => {
    expect(component.dropdownContainer).toBeDefined();
    expect(component.isOpen).toBeFalsy();
    expect(component.selected()).toBeNull();
  });

  it('should toggle dropdown on button click', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(component.isOpen).toBeFalsy();

    button.triggerEventHandler('click', {});
    expect(component.isOpen).toBeTruthy();

    button.triggerEventHandler('click', {});
    expect(component.isOpen).toBeFalsy();
  });

  it('should emit selected item id and update state on item selection', () => {
    const itemSelectedSpy = jest.spyOn(component.itemSelected, 'emit');
    component.isOpen = true;
    component.selectItem(mockOptions[0]);

    expect(itemSelectedSpy).toHaveBeenCalledWith(mockOptions[0].id);
    expect(component.selected()).toEqual(mockOptions[0]);
    expect(component.isOpen).toBeFalsy();
  });

  it('should handle click events for opening and closing dropdown', () => {
    component.isOpen = true;

    // Click outside
    const outsideClick = new MouseEvent('click');
    component.onClickOutside(outsideClick);
    expect(component.isOpen).toBeFalsy();

    // Click inside
    component.isOpen = true;
    const insideClick = new MouseEvent('click');
    Object.defineProperty(insideClick, 'target', {
      value: component.dropdownContainer.nativeElement,
    });
    component.onClickOutside(insideClick);
    expect(component.isOpen).toBeTruthy();
  });

  it('should handle empty options and clearId input', () => {
    fixture.componentRef.setInput('options', []);
    fixture.componentRef.setInput('clearId', 'Clear Option');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', {});
    expect(component.isOpen).toBeTruthy();

    const itemSelectedSpy = jest.spyOn(component.itemSelected, 'emit');
    component.selectItem({ id: 'Clear Option', label: 'Clear Option' });
    expect(itemSelectedSpy).toHaveBeenCalledWith('Clear Option');
    expect(component.isOpen).toBeFalsy();
  });
});
