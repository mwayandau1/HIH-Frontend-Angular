/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { adminDashboardNavigation, providerDashboardNavigation } from '@shared/constants/dashboard';
import { By } from '@angular/platform-browser';
import { UserRole } from '@shared/models/userRoles';
import { AuthService } from '@core/services/auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let routerEventsSubject: Subject<any>;
  let scrollContainer: HTMLElement;

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterModule.forRoot([]), LucideAngularModule],
      providers: [
        AuthService,
        provideHttpClient(),
        {
          provide: Router,
          useValue: {
            events: routerEventsSubject.asObservable(),
            url: '/test',
            navigate: jest.fn(),
            routerState: {
              snapshot: {
                root: {},
              },
            },
            createUrlTree: jest.fn(),
            serializeUrl: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    scrollContainer = document.createElement('div');
    scrollContainer.id = 'scrollContainer';
    fixture.nativeElement.appendChild(scrollContainer);
    scrollContainer.scrollTo = jest.fn();

    component['userRole'].set(UserRole.Admin);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with admin role by default', () => {
    component['userRole'].set(UserRole.Admin);
    expect(component['links']()).toEqual(adminDashboardNavigation);
  });

  it('should provide correct icons', () => {
    expect(component['icons']).toEqual({
      Bell: expect.anything(),
      CircleUserRound: expect.anything(),
      LogOut: expect.anything(),
    });
  });

  it('should render correct number of navigation items', () => {
    const navItems = fixture.debugElement.queryAll(By.css('ul > li'));

    if (component['userRole']() === UserRole.Admin)
      expect(navItems.length).toBe(adminDashboardNavigation.length);
    else expect(navItems.length).toBe(providerDashboardNavigation.length);
  });

  it('should render icons', () => {
    const icons = fixture.nativeElement.querySelectorAll('lucide-icon');
    expect(icons.length).toBeGreaterThan(0);
  });

  describe('Router Events Subscription', () => {
    it('should not scroll on other router events', () => {
      const scrollContainer = fixture.nativeElement.querySelector('#scrollContainer');
      routerEventsSubject.next({});
      fixture.detectChanges();
      expect(scrollContainer.scrollTo).not.toHaveBeenCalled();
    });

    it('should handle missing scroll container gracefully', () => {
      const scrollContainer = fixture.nativeElement.querySelector('#scrollContainer');
      fixture.nativeElement.removeChild(scrollContainer);
      expect(() => {
        routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

describe('DashboardComponent as Provider', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterModule.forRoot([]), LucideAngularModule],
      providers: [
        AuthService,
        provideHttpClient(),
        {
          provide: Router,
          useValue: {
            events: of(new NavigationEnd(1, '/provider', '/provider')),
            url: '/provider',
            navigate: jest.fn(),
            routerState: {
              snapshot: {
                root: {},
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    component['userRole'].set(UserRole.Provider);
    fixture.detectChanges();
  });

  it('should return provider links when role is provider', () => {
    const actualLinks = component['links']();
    expect(actualLinks).not.toEqual(adminDashboardNavigation);
    expect(actualLinks).toEqual(
      expect.arrayContaining(
        providerDashboardNavigation.map((item) => ({
          label: item.label,
          route: item.route,
          icon: expect.anything(),
        })),
      ),
    );
  });

  it('should render navigation links for provider role', () => {
    const navLinks = fixture.debugElement.queryAll(By.css('ul > li'));
    expect(navLinks.length).toBe(providerDashboardNavigation.length);
  });

  describe('Logout functionality', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      jest.spyOn(authService, 'logout').mockImplementation(() => {});
      jest.spyOn(router, 'navigate').mockImplementation(() => of(true).toPromise());
    });

    it('should call authService.logout()', () => {
      component['handleLogout']();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should navigate to login page', () => {
      component['handleLogout']();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
