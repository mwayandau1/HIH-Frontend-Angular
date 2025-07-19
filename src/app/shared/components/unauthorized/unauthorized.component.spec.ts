import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnauthorizedPageComponent } from './unauthorized.component';
import { ButtonComponent } from '../button/button.component';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { UserRole } from '@shared/models/userRoles';

describe('UnauthorizedPageComponent', () => {
  let component: UnauthorizedPageComponent;
  let fixture: ComponentFixture<UnauthorizedPageComponent>;
  let routerMock: jest.Mocked<Router>;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    authServiceMock = {
      getUserRole: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      imports: [UnauthorizedPageComponent, ButtonComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleNavigate', () => {
    it('should navigate to user role route when user has a role', () => {
      const mockRole = UserRole.Admin;
      authServiceMock.getUserRole.mockReturnValue(mockRole);

      component.handleNavigate();

      expect(authServiceMock.getUserRole).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith([`/${mockRole}`]);
    });

    it('should navigate to base route when user has no role', () => {
      authServiceMock.getUserRole.mockReturnValue(null);

      component.handleNavigate();

      expect(authServiceMock.getUserRole).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
