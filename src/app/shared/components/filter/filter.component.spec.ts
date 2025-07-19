import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterInputComponent } from './filter.component';
import { FilterOption } from '@shared/models/filters';

describe('FilterInputComponent', () => {
  let component: FilterInputComponent;
  let fixture: ComponentFixture<FilterInputComponent>;

  const mockFilterOptions: FilterOption[] = [
    {
      id: 'age',
      label: 'Age Range',
      expanded: false,
      children: [
        { id: '', label: 'Clear' },
        { id: 'under18', label: 'Under 18' },
        { id: '19to40', label: '19 - 40' },
        { id: '41to65', label: '41 - 65' },
        { id: 'over65', label: 'Over 65' },
      ],
    },
    {
      id: 'gender',
      label: 'Gender',
      expanded: false,
      children: [
        { id: '', label: 'Clear' },
        { id: 'MALE', label: 'Male' },
        { id: 'FEMALE', label: 'Female' },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filterOptions', mockFilterOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize with dropdown closed', () => {
      expect(component['isDropdownOpen']()).toBe(false);
    });

    it('should initialize with no expanded sections', () => {
      expect(component['expandedSections']()).toEqual({});
    });

    it('should initialize with no selected option', () => {
      expect(component['selectedOption']()).toBeNull();
    });

    it('should compute filter options with expanded state', () => {
      const computedOptions = component['computedFilterOptions']();
      expect(computedOptions.length).toBe(mockFilterOptions.length);
      computedOptions.forEach((option) => {
        expect(option.expanded).toBe(false);
      });
    });
  });

  describe('toggleDropdown', () => {
    it('should toggle dropdown state when no parameter provided', () => {
      component['toggleDropdown']();
      expect(component['isDropdownOpen']()).toBe(true);

      component['toggleDropdown']();
      expect(component['isDropdownOpen']()).toBe(false);
    });

    it('should set specific dropdown state when parameter provided', () => {
      component['toggleDropdown'](true);
      expect(component['isDropdownOpen']()).toBe(true);

      component['toggleDropdown'](false);
      expect(component['isDropdownOpen']()).toBe(false);
    });

    it('should clear expanded sections when closing dropdown', () => {
      component['expandedSections'].set({ age: true });
      component['toggleDropdown'](false);
      expect(component['expandedSections']()).toEqual({});
    });
  });

  describe('toggleSection', () => {
    it('should toggle section expansion state', () => {
      component['toggleSection']('age');
      expect(component['expandedSections']()).toEqual({ age: true });

      component['toggleSection']('age');
      expect(component['expandedSections']()).toEqual({ age: false });
    });

    it('should not affect other sections when toggling one', () => {
      component['expandedSections'].set({ gender: true });
      component['toggleSection']('age');
      expect(component['expandedSections']()).toEqual({ age: true });
    });
  });

  describe('selectOption', () => {
    it('should emit selected value and label for valid option', () => {
      const emitSpy = jest.spyOn(component.selectedValue, 'emit');
      const testOption = { id: '18-30', label: '18-30' };

      component['selectOption'](testOption, 'Age Range');

      expect(component['selectedOption']()).toBe('18-30');
      expect(emitSpy).toHaveBeenCalledWith({ value: '18-30', label: 'Age Range' });
      expect(component['isDropdownOpen']()).toBe(false);
      expect(component['expandedSections']()).toEqual({});
    });

    it('should handle null option selection', () => {
      const emitSpy = jest.spyOn(component.selectedValue, 'emit');
      const testOption = { id: '', label: 'Clear' };

      component['selectOption'](testOption, 'Age Range');

      expect(component['selectedOption']()).toBeNull();
      expect(emitSpy).toHaveBeenCalledWith({ value: null, label: 'Age Range' });
      expect(component['isDropdownOpen']()).toBe(false);
      expect(component['expandedSections']()).toEqual({});
    });
  });

  describe('computedFilterOptions', () => {
    it('should reflect section expansion state', () => {
      component['expandedSections'].set({ age: true });
      const computedOptions = component['computedFilterOptions']();

      const ageOption = computedOptions.find((o) => o.id === 'age');
      expect(ageOption?.expanded).toBe(true);

      const genderOption = computedOptions.find((o) => o.id === 'gender');
      expect(genderOption?.expanded).toBe(false);
    });
  });
});
