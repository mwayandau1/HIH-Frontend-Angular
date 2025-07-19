import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;
  let navigateMock: jest.Mock;

  beforeEach(async () => {
    navigateMock = jest.fn();

    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (key: string) => {
                if (key === 'page') return '2';
                return null;
              },
            }),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: navigateMock,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('amountOnDisplay', 12);
    fixture.componentRef.setInput('totalRecords', 12);
    fixture.componentRef.setInput('numOfPages', 1);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to page 1 when query param page is not a number', () => {
    TestBed.resetTestingModule();
    const routeWithInvalidPage = {
      queryParamMap: of({
        get: (key: string) => (key === 'page' ? 'invalid' : null),
      }),
    };

    TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeWithInvalidPage },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(PaginationComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('amountOnDisplay', 12);
    fixture.componentRef.setInput('totalRecords', 12);
    fixture.componentRef.setInput('numOfPages', 5);
    fixture.detectChanges();

    expect(component['currentPage']()).toBe(1);
  });

  it('should default to page 1 when query param page is less than 1', () => {
    TestBed.resetTestingModule();
    const routeWithPage0 = {
      queryParamMap: of({
        get: (key: string) => (key === 'page' ? '0' : null),
      }),
    };

    TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeWithPage0 },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(PaginationComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('amountOnDisplay', 12);
    fixture.componentRef.setInput('totalRecords', 12);
    fixture.componentRef.setInput('numOfPages', 5);
    fixture.detectChanges();

    expect(component['currentPage']()).toBe(1);
  });

  it('should navigate to next page when direction is "next"', () => {
    component['currentPage'].set(2);
    component['onChangePage']('next');
    fixture.componentRef.setInput('amountOnDisplay', 12);
    fixture.componentRef.setInput('totalRecords', 12);
    expect(navigateMock).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 3 },
      queryParamsHandling: 'merge',
    });
    expect(component['currentPage']()).toBe(3);
  });

  it('should navigate to previous page when direction is "prev"', () => {
    component['currentPage'].set(3);
    component['onChangePage']('prev');

    expect(navigateMock).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 2 },
      queryParamsHandling: 'merge',
    });
    expect(component['currentPage']()).toBe(2);
  });

  it('should navigate to specific page when page number is provided', () => {
    component['onChangePage'](undefined, 5);

    expect(navigateMock).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 5 },
      queryParamsHandling: 'merge',
    });
    expect(component['currentPage']()).toBe(5);
  });

  it('should navigate to page 1 when no arguments are provided', () => {
    component['currentPage'].set(3);
    component['onChangePage']();

    expect(navigateMock).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
    expect(component['currentPage']()).toBe(1);
  });
});
