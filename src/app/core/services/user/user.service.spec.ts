import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from '../api/api.service';
import { Gender, UserProfile, UserResponse, User, UserDataResponse } from '@shared/models';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

describe('UserService', () => {
  let service: UserService;
  let apiServiceMock: jest.Mocked<ApiService>;
  const baseUrl = environment.gatewayUrl;

  const mockUserResponse: UserResponse = {
    success: true,
    message: 'User fetched',
    timestamp: '',
    data: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '11/11/1111',
      bio: '',
      gender: Gender.Male,
      profilePictureUrl: '',
      residentialAddress: 'Nowhere',
      twoFactorEnabled: false,
      twoFactorMethod: 'EMAIL',
      title: 'Doc',
      department: 'Cardio',
      licenseNumber: 'MD1234567',
      roles: [],
    },
  };

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    roles: [{ id: 1, name: 'Admin' }],
    department: 'IT',
    contact: '+1234567890',
    active: true,
  };

  const mockUserDataResponse: UserDataResponse = {
    message: 'Operation successful',
    content: [mockUser],
    pageable: {
      pageNumber: 0,
      pageSize: 10,
    },
    totalPages: 1,
    totalElements: 1,
    first: true,
    last: true,
    numberOfElements: 1,
  };

  beforeEach(() => {
    apiServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    TestBed.configureTestingModule({
      providers: [UserService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(UserService);
  });

  describe('getUserInfo', () => {
    it('should call API with correct parameters and return user data', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserResponse));

      service.getUserInfo().subscribe((response) => {
        expect(response).toEqual(mockUserResponse);
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.user.getInfo);
    });

    it('should handle error when getting user info', () => {
      const error = new Error('Failed to fetch user info');
      apiServiceMock.get.mockReturnValue(throwError(() => error));

      service.getUserInfo().subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.user.getInfo);
    });
  });

  describe('changeUserPassword', () => {
    it('should call API with correct parameters and payload', () => {
      apiServiceMock.put.mockReturnValue(of(undefined));

      const currentPassword = 'oldPass123';
      const newPassword = 'newPass123';
      const confirmPassword = 'newPass123';

      service
        .changeUserPassword({ currentPassword, newPassword, confirmPassword })
        .subscribe(() => {
          expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.updatePassword, {
            currentPassword,
            newPassword,
            confirmPassword,
          });
        });
    });

    it('should handle error when changing password', () => {
      const error = new Error('Failed to change password');
      apiServiceMock.put.mockReturnValue(throwError(() => error));

      service
        .changeUserPassword({
          currentPassword: 'old',
          newPassword: 'new',
          confirmPassword: 'new',
        })
        .subscribe({
          error: (err) => {
            expect(err).toEqual(error);
          },
        });

      expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.updatePassword, {
        currentPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new',
      });
    });
  });

  describe('updateUserInfo', () => {
    it('should call API with correct parameters and payload', () => {
      apiServiceMock.put.mockReturnValue(of(undefined));

      const userInfo: Omit<UserProfile, 'twoFactorMethod' | 'twoFactorEnabled' | 'roles' | 'id'> = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        dateOfBirth: '11/11/1111',
        bio: '',
        title: '',
        department: '',
        licenseNumber: '',
        gender: Gender.Male,
        profilePictureUrl: '',
        residentialAddress: 'Nowhere',
      };

      service.updateUserInfo(userInfo).subscribe(() => {
        expect(apiServiceMock.put).toHaveBeenCalledWith(
          baseUrl,
          endpoints.user.updateUserInfo,
          userInfo,
        );
      });
    });

    it('should handle error when updating user info', () => {
      const error = new Error('Failed to update user info');
      apiServiceMock.put.mockReturnValue(throwError(() => error));

      const userInfo: Omit<UserProfile, 'twoFactorMethod' | 'twoFactorEnabled' | 'roles' | 'id'> = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        dateOfBirth: '11/11/1111',
        bio: '',
        gender: Gender.Male,
        profilePictureUrl: '',
        residentialAddress: 'Nowhere',
        title: '',
        department: '',
        licenseNumber: '',
      };

      service.updateUserInfo(userInfo).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.put).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.updateUserInfo,
        userInfo,
      );
    });
  });

  describe('updateMfa', () => {
    it('should enable MFA with email method', () => {
      apiServiceMock.put.mockReturnValue(of(mockUserResponse));

      service.updateMfa(true, 'EMAIL').subscribe((response) => {
        expect(response).toEqual(mockUserResponse);
        expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.updateTwoFactor, {
          enabled: true,
          method: 'EMAIL',
        });
      });
    });

    it('should enable MFA with SMS method', () => {
      apiServiceMock.put.mockReturnValue(of(mockUserResponse));

      service.updateMfa(true, 'SMS').subscribe((response) => {
        expect(response).toEqual(mockUserResponse);
        expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.updateTwoFactor, {
          enabled: true,
          method: 'SMS',
        });
      });
    });

    it('should disable MFA', () => {
      apiServiceMock.put.mockReturnValue(of(mockUserResponse));

      service.updateMfa(false, null).subscribe((response) => {
        expect(response).toEqual(mockUserResponse);
        expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.updateTwoFactor, {
          enabled: false,
          method: null,
        });
      });
    });

    it('should handle error when updating MFA', () => {
      const error = new Error('Failed to update MFA');
      apiServiceMock.put.mockReturnValue(throwError(() => error));

      service.updateMfa(true, 'EMAIL').subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.updateTwoFactor, {
        enabled: true,
        method: 'EMAIL',
      });
    });
  });

  describe('createUser', () => {
    it('should call API with correct parameters and payload', () => {
      apiServiceMock.post.mockReturnValue(of(mockUserDataResponse));

      service.createUser(mockUser).subscribe((response) => {
        expect(response).toEqual(mockUserDataResponse);
        expect(apiServiceMock.post).toHaveBeenCalledWith(
          baseUrl,
          endpoints.user.registerUser,
          mockUser,
        );
      });
    });

    it('should handle error when creating user', () => {
      const error = new Error('Failed to create user');
      apiServiceMock.post.mockReturnValue(throwError(() => error));

      service.createUser(mockUser).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.post).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.registerUser,
        mockUser,
      );
    });
  });

  describe('updateUser', () => {
    it('should call API with correct parameters and payload', () => {
      apiServiceMock.put.mockReturnValue(of(mockUserDataResponse));

      service.updateUser(1, mockUser).subscribe((response) => {
        expect(response).toEqual(mockUserDataResponse);
        expect(apiServiceMock.put).toHaveBeenCalledWith(
          baseUrl,
          endpoints.user.handleUser(1),
          mockUser,
        );
      });
    });

    it('should handle error when updating user', () => {
      const error = new Error('Failed to update user');
      apiServiceMock.put.mockReturnValue(throwError(() => error));

      service.updateUser(1, mockUser).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.put).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.handleUser(1),
        mockUser,
      );
    });
  });

  describe('toggleStatus', () => {
    it('should call API with correct parameters', () => {
      apiServiceMock.put.mockReturnValue(of(mockUserDataResponse));

      service.toggleStatus(1).subscribe((response) => {
        expect(response).toEqual(mockUserDataResponse);
        expect(apiServiceMock.put).toHaveBeenCalledWith(
          baseUrl,
          endpoints.user.handleStatus(1),
          {},
        );
      });
    });

    it('should handle error when toggling status', () => {
      const error = new Error('Failed to toggle status');
      apiServiceMock.put.mockReturnValue(throwError(() => error));

      service.toggleStatus(1).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.put).toHaveBeenCalledWith(baseUrl, endpoints.user.handleStatus(1), {});
    });
  });

  describe('getUsers', () => {
    it('should call API with correct parameters without params', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service.getUsers().subscribe((response) => {
        expect(response).toEqual(mockUserDataResponse);
        expect(apiServiceMock.get).toHaveBeenCalledWith(baseUrl, endpoints.user.getUsers(''));
      });
    });

    it('should call API with department param', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service.getUsers({ department: 'ENDOCRINOLOGY' }).subscribe();
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.getUsers('?department=ENDOCRINOLOGY'),
      );
    });

    it('should call API with role param', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service.getUsers({ role: 'admin' }).subscribe();
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.getUsers('?roles=admin'),
      );
    });

    it('should call API with active param', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service.getUsers({ active: true }).subscribe();
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.getUsers('?active=true'),
      );
    });

    it('should call API with search param', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service.getUsers({ search: 'john' }).subscribe();
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.getUsers('?searchTerm=john'),
      );
    });

    it('should call API with page and size params', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service.getUsers({ page: 2, size: 20 }).subscribe();
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.getUsers('?page=2&size=20'),
      );
    });

    it('should call API with all params combined', () => {
      apiServiceMock.get.mockReturnValue(of(mockUserDataResponse));
      service
        .getUsers({
          department: 'ENDOCRINOLOGY',
          role: 'admin',
          active: false,
          search: 'john',
          page: 1,
          size: 10,
          sort: ['firstName,asc', 'lastName,desc'],
        })
        .subscribe();
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        baseUrl,
        endpoints.user.getUsers(
          '?sort=firstName,asc&sort=lastName,desc&department=ENDOCRINOLOGY&roles=admin&active=false&searchTerm=john&page=1&size=10',
        ),
      );
    });
  });

  describe('deleteUser', () => {
    it('should call API with correct parameters', () => {
      apiServiceMock.delete.mockReturnValue(of(mockUserDataResponse));

      service.deleteUser(1).subscribe((response) => {
        expect(response).toEqual(mockUserDataResponse);
        expect(apiServiceMock.delete).toHaveBeenCalledWith(baseUrl, endpoints.user.handleUser(1));
      });
    });

    it('should handle error when deleting user', () => {
      const error = new Error('Failed to delete user');
      apiServiceMock.delete.mockReturnValue(throwError(() => error));

      service.deleteUser(1).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
        },
      });

      expect(apiServiceMock.delete).toHaveBeenCalledWith(baseUrl, endpoints.user.handleUser(1));
    });
  });
});
