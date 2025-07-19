import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, RolesResponse } from '../../../shared/models/user';
import { PermissionsResponse } from '@shared/models';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.roles;
  private readonly baseUrl = environment.gatewayUrl;

  public getRoles(): Observable<RolesResponse> {
    return this.apiService.get<RolesResponse>(this.baseUrl, this.endpoints.handleRoles);
  }

  public getPermissions(): Observable<PermissionsResponse> {
    return this.apiService.get<PermissionsResponse>(
      this.baseUrl,
      this.endpoints.getPermissions,
      {},
    );
  }

  public createRole(roleData: Role): Observable<RolesResponse> {
    return this.apiService.post<RolesResponse>(this.baseUrl, this.endpoints.handleRoles, roleData);
  }

  public updateRole(data: { id: number; roleData: Role }): Observable<RolesResponse> {
    return this.apiService.put<RolesResponse>(
      this.baseUrl,
      this.endpoints.handleRole(data.id),
      data.roleData,
    );
  }

  public updateRoleStatus(id: number): Observable<RolesResponse> {
    return this.apiService.patch<RolesResponse>(this.baseUrl, this.endpoints.handleRole(id), {});
  }

  public deleteRole(id: number): Observable<RolesResponse> {
    return this.apiService.delete<RolesResponse>(this.baseUrl, this.endpoints.handleRole(id));
  }
}
