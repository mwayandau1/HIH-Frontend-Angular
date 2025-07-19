import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RoleService } from './roles.service';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { Role, RolesResponse } from '../../../shared/models/user';
import { PermissionsResponse } from '@shared/models';
import { environment } from '@core/environments/environments';

const mockApiService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

describe('RoleService', () => {
  let service: RoleService;
  const baseUrl = environment.gatewayUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleService, { provide: ApiService, useValue: mockApiService }],
    });
    service = TestBed.inject(RoleService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRoles', () => {
    it('should call ApiService.get with correct parameters and return RolesResponse', (done) => {
      const mockResponse: RolesResponse = { message: 'Success', data: [{ id: 1, name: 'Admin' }] };
      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getRoles().subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.get).toHaveBeenCalledWith(baseUrl, endpoints.roles.handleRoles);
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.get', (done) => {
      const error = new Error('Failed to fetch roles');
      mockApiService.get.mockReturnValue(throwError(() => error));

      service.getRoles().subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.get).toHaveBeenCalledWith(baseUrl, endpoints.roles.handleRoles);
          done();
        },
      });
    });
  });

  describe('getPermissions', () => {
    it('should call ApiService.get with correct parameters and return PermissionsResponse', (done) => {
      const mockResponse: PermissionsResponse = {
        data: [{ id: 2, name: 'READ' }],
        success: true,
        message: 'string',
      };
      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getPermissions().subscribe({
        next: (response: RolesResponse) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.get).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.getPermissions,
            {},
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.get for permissions', (done) => {
      const error = new Error('Failed to fetch permissions');
      mockApiService.get.mockReturnValue(throwError(() => error));

      service.getPermissions().subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.get).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.getPermissions,
            {},
          );
          done();
        },
      });
    });
  });

  describe('createRole', () => {
    it('should call ApiService.post with correct parameters and role data', (done) => {
      const roleData: Role = { id: 2, name: 'Editor' };
      const mockResponse: RolesResponse = { data: [roleData], message: 'Success' };
      mockApiService.post.mockReturnValue(of(mockResponse));

      service.createRole(roleData).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.post).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRoles,
            roleData,
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.post', (done) => {
      const roleData: Role = { id: 2, name: 'Editor' };
      const error = new Error('Failed to create role');
      mockApiService.post.mockReturnValue(throwError(() => error));

      service.createRole(roleData).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.post).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRoles,
            roleData,
          );
          done();
        },
      });
    });
  });

  describe('updateRole', () => {
    it('should call ApiService.put with correct parameters and role data', (done) => {
      const roleData: Role = { id: 1, name: 'Updated Admin' };
      const mockResponse: RolesResponse = { data: [roleData], message: 'Success' };
      mockApiService.put.mockReturnValue(of(mockResponse));

      service.updateRole({ id: 1, roleData }).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.put).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRole(1),
            roleData,
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.put', (done) => {
      const roleData: Role = { id: 1, name: 'Updated Admin' };
      const error = new Error('Failed to update role');
      mockApiService.put.mockReturnValue(throwError(() => error));

      service.updateRole({ id: 1, roleData }).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.put).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRole(1),
            roleData,
          );
          done();
        },
      });
    });
  });

  describe('updateRoleStatus', () => {
    it('should call ApiService.patch with correct parameters', (done) => {
      const mockResponse: RolesResponse = {
        data: [{ id: 1, name: 'Admin', active: true }],
        message: 'Success',
      };
      mockApiService.patch.mockReturnValue(of(mockResponse));

      service.updateRoleStatus(1).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.patch).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRole(1),
            {},
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.patch', (done) => {
      const error = new Error('Failed to update role status');
      mockApiService.patch.mockReturnValue(throwError(() => error));

      service.updateRoleStatus(1).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.patch).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRole(1),
            {},
          );
          done();
        },
      });
    });
  });

  describe('deleteRole', () => {
    it('should call ApiService.delete with correct parameters', (done) => {
      const mockResponse: RolesResponse = { data: [], message: 'Success' };
      mockApiService.delete.mockReturnValue(of(mockResponse));

      service.deleteRole(1).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(mockApiService.delete).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRole(1),
          );
          done();
        },
        error: () => done.fail('Expected success, but got error'),
      });
    });

    it('should handle error from ApiService.delete', (done) => {
      const error = new Error('Failed to delete role');
      mockApiService.delete.mockReturnValue(throwError(() => error));

      service.deleteRole(1).subscribe({
        next: () => done.fail('Expected error, but got success'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(mockApiService.delete).toHaveBeenCalledWith(
            baseUrl,
            endpoints.roles.handleRole(1),
          );
          done();
        },
      });
    });
  });
});
