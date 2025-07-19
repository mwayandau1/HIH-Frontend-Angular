import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SandwitchLayoutComponent } from './sandwitch.component';
import { provideHttpClient } from '@angular/common/http';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideMockStore } from '@ngrx/store/testing';

class MockRouter {
  public url = '/patient/appointments';
  public events = new Subject();
  navigate = jest.fn();
  createUrlTree = jest.fn().mockReturnValue({});
  serializeUrl = jest.fn((url: string) => url);
}

describe('SandwitchLayoutComponent', () => {
  let component: SandwitchLayoutComponent;
  let fixture: ComponentFixture<SandwitchLayoutComponent>;
  let router: MockRouter;

  beforeEach(async () => {
    router = new MockRouter();
    await TestBed.configureTestingModule({
      imports: [SandwitchLayoutComponent],
      providers: [
        provideHttpClient(),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        provideMockStore({
          initialState: {
            user: {
              data: null,
              loading: false,
              error: null,
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SandwitchLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header and footer', () => {
    const header = fixture.debugElement.query(By.css('app-header'));
    const footer = fixture.debugElement.query(By.css('app-footer'));
    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should render the dashboard title', () => {
    const title = fixture.debugElement.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Patient Healthcare Dashboard');
  });

  it('should show breadcrumbs when currentUrl is not "patient"', () => {
    component.currentUrl.set('appointments');
    fixture.detectChanges();
    const breadcrumb = fixture.debugElement.nativeElement.querySelector('ul');
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.textContent).toContain('Dashboard');
    expect(breadcrumb.textContent).toContain('Appointments');
  });

  it('should NOT show breadcrumbs when currentUrl is "patient"', () => {
    component.currentUrl.set('patient');
    fixture.detectChanges();
    const breadcrumb = fixture.debugElement.nativeElement.querySelector('ul');
    expect(breadcrumb).toBeNull();
  });

  it('should update currentUrl on NavigationEnd event', () => {
    router.url = '/patient/medical-records';
    router.events.next(
      new NavigationEnd(1, '/patient/medical-records', '/patient/medical-records'),
    );
    fixture.detectChanges();
    expect(component.currentUrl()).toBe('medical-records');
    const breadcrumb = fixture.debugElement.nativeElement.querySelector('ul');
    expect(breadcrumb.textContent).toContain('Medical-records');
  });

  it('should set currentUrl to "patient" if there is no third segment in the initial url', () => {
    router.url = '/patient';
    fixture = TestBed.createComponent(SandwitchLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.currentUrl()).toBe('patient');
  });
});
