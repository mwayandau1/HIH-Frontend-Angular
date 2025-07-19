/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { ButtonComponent } from '../button/button.component';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let mockPatients: any[];
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: of({ page: '1' }),
      queryParamMap: of(convertToParamMap({ page: '1' })),
    };

    await TestBed.configureTestingModule({
      imports: [TableComponent, ButtonComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;

    mockPatients = [
      {
        id: 'QR1805',
        firstName: 'Collen',
        lastName: 'Lowde',
        dateOfBirth: '6/27/2024',
        phoneNumber: '+86-800-993-7513',
      },
      {
        id: 'IB6405',
        firstName: 'Prinz',
        lastName: 'Doy',
        dateOfBirth: '10/25/2024',
        phoneNumber: '+387-324-956-5121',
      },
    ];

    fixture.componentRef.setInput('headCols', ['Name', 'Date of Birth', 'Phone Number', 'Actions']);
    fixture.componentRef.setInput('data', mockPatients);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct header columns', () => {
    const headerCells = fixture.debugElement.queryAll(By.css('thead th'));
    expect(headerCells.length).toBe(4);
    expect(headerCells[0].nativeElement.textContent).toContain('Name');
    expect(headerCells[1].nativeElement.textContent).toContain('Date of Birth');
    expect(headerCells[2].nativeElement.textContent).toContain('Phone Number');
    expect(headerCells[3].nativeElement.textContent).toContain('Actions');
  });

  it('should display correct patient data', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);

    const firstRowCells = rows[0].queryAll(By.css('td'));
    expect(firstRowCells[0].nativeElement.textContent).toContain('CL');
    expect(firstRowCells[0].nativeElement.textContent).toContain('Collen Lowde');
    expect(firstRowCells[1].nativeElement.textContent).toContain('QR1805');
    expect(firstRowCells[2].nativeElement.textContent).toContain('6/27/2024');
    expect(firstRowCells[3].nativeElement.textContent).toContain('+86-800-993-7513');
  });

  it('should generate correct patient initials', () => {
    expect(component['getPatientInitials']('John', 'Doe')).toBe('JD');
    expect(component['getPatientInitials']('Alice', 'Cooper')).toBe('AC');
  });

  it('should limit view to 12 patients per page', () => {
    const manyPatients = Array(15)
      .fill(0)
      .map((_, i) => ({
        id: i.toString(),
        firstName: `Patient${i}`,
        lastName: `Last${i}`,
        dateOfBirth: `01/01/200${i}`,
        phoneNumber: `123234${i}`,
      }));

    fixture.componentRef.setInput('data', manyPatients);
    fixture.detectChanges();

    expect(component['pageItems']().length).toBe(12);
  });

  it('should emit action event when button is clicked', () => {
    const actionButton = jest.spyOn(component.action, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('app-button'));

    const mockEvent = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as Event;

    buttons[0].triggerEventHandler('clickEvent', mockEvent);
    expect(actionButton).toHaveBeenCalledWith('QR1805');
  });

  it('should handle empty data gracefully', () => {
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
  });

  it('should display correct number of action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    expect(buttons.length).toBe(mockPatients.length);
  });

  it('should display all patient data fields', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    const firstRowCells = rows[0].queryAll(By.css('td'));

    expect(firstRowCells[0].nativeElement.textContent).toContain('CL');
    expect(firstRowCells[0].nativeElement.textContent).toContain('Collen Lowde');
    expect(firstRowCells[1].nativeElement.textContent).toContain('QR1805');
    expect(firstRowCells[2].nativeElement.textContent).toContain('6/27/2024');
    expect(firstRowCells[3].nativeElement.textContent).toContain('+86-800-993-7513');
  });

  describe('constructor queryParams handling', () => {
    it('should set currentPage to 1 when no page param is provided', () => {
      expect(component['currentPage']()).toBe(1);
    });

    it('should set currentPage to the provided page number when valid', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ page: '3' });

      fixture = TestBed.createComponent(TableComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('headCols', [
        'Name',
        'Date of Birth',
        'Phone Number',
        'Actions',
      ]);
      fixture.componentRef.setInput('data', mockPatients);

      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(3);
    }));

    it('should handle string page numbers and convert them to numbers', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ page: '5' });

      fixture = TestBed.createComponent(TableComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('headCols', [
        'Name',
        'Date of Birth',
        'Phone Number',
        'Actions',
      ]);
      fixture.componentRef.setInput('data', mockPatients);

      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(5);
    }));

    it('should default to page 1 when page param is NaN', () => {
      mockActivatedRoute.queryParams = of({ page: 'invalid' });

      expect(component['currentPage']()).toBe(1);
    });

    it('should default to page 1 when page param is missing', () => {
      mockActivatedRoute.queryParams = of({});

      expect(component['currentPage']()).toBe(1);
    });

    it('should default to page 1 when page param is empty string', () => {
      mockActivatedRoute.queryParams = of({ page: '' });

      expect(component['currentPage']()).toBe(1);
    });

    it('should handle decimal numbers by truncating them', fakeAsync(() => {
      mockActivatedRoute.queryParams = of({ page: '2.99' });

      fixture = TestBed.createComponent(TableComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('headCols', [
        'Name',
        'Date of Birth',
        'Phone Number',
        'Actions',
      ]);
      fixture.componentRef.setInput('data', mockPatients);

      fixture.detectChanges();
      tick();

      expect(component['currentPage']()).toBe(2);
    }));
  });

  describe('queryParams handling in constructor', () => {
    let component: TableComponent;
    let fixture: ComponentFixture<TableComponent>;
    let mockActivatedRoute: any;
    const mockPatients = [
      {
        id: 'QR1805',
        firstName: 'Collen',
        lastName: 'Lowde',
        dateOfBirth: '6/27/2024',
        phoneNumber: '+86-800-993-7513',
      },
    ];

    function setupTest(pageParam: any) {
      mockActivatedRoute = {
        queryParams: of({ page: pageParam }),
        queryParamMap: of(convertToParamMap({ page: pageParam })),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TableComponent, ButtonComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: mockActivatedRoute,
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TableComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('headCols', [
        'Name',
        'Date of Birth',
        'Phone Number',
        'Actions',
      ]);
      fixture.componentRef.setInput('data', mockPatients);
      fixture.detectChanges();
    }

    it('should set currentPage to 1 when page param is null', fakeAsync(() => {
      setupTest(null);
      tick();
      expect(component['currentPage']()).toBe(1);
    }));

    it('should set currentPage to 1 when page param is undefined', fakeAsync(() => {
      setupTest(undefined);
      tick();
      expect(component['currentPage']()).toBe(1);
    }));

    it('should handle negative page numbers by defaulting to 1', fakeAsync(() => {
      setupTest('-5');
      tick();
      expect(component['currentPage']()).toBe(1);
    }));

    it('should handle zero page number by defaulting to 1', fakeAsync(() => {
      setupTest('0');
      tick();
      expect(component['currentPage']()).toBe(1);
    }));

    it('should handle very large page numbers correctly', fakeAsync(() => {
      setupTest('9999999999');
      tick();
      expect(component['currentPage']()).toBe(9999999999);
    }));
  });
});
